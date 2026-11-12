"""配音转逐字时间：按波形真实停顿切小句，每句单独识别文字；时间取波形起止（模型的逐字时间戳在长音频上会漂）。
准备：pip install funasr modelscope numpy（第一次运行会自动下载 paraformer-zh 中文模型，约 1GB）
      先把配音转成 16k 单声道：ffmpeg -y -i public/voice.mp3 -ac 1 -ar 16000 scripts/voice16k.wav
用法：python scripts/asr.py
输出：scripts/words.json（[起ms, 止ms, 字]，给 align.mjs 用）、scripts/phrases.json（每小句，核对用）、scripts/words.txt
环境变量：ASR_MODEL 指向本地模型目录（不给就用 paraformer-zh 自动下载）；ASR_THRESH 静音阈值（默认 250，底噪大就调高）
"""
import json, os, re, wave
import numpy as np
from funasr import AutoModel

HERE = os.path.dirname(os.path.abspath(__file__))
SR, H = 16000, 160
TH = float(os.environ.get('ASR_THRESH', '250'))
with wave.open(os.path.join(HERE, 'voice16k.wav'), 'rb') as w:
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
n = len(a) // H
e = np.sqrt(np.mean((a[:n * H].astype(np.float64)).reshape(n, H) ** 2, axis=1))
on = e > TH
sp = []
i = 0
while i < n:
    if on[i]:
        j = i
        gap = 0
        k = i
        while k < n and gap < 15:
            if on[k]:
                j = k + 1
                gap = 0
            else:
                gap += 1
            k += 1
        if j - i >= 6:
            sp.append([i, j])
        i = max(k, j)
    else:
        i += 1
print('phrases', len(sp))
m = AutoModel(model=os.environ.get('ASR_MODEL', 'paraformer-zh'), disable_update=True, log_level='ERROR', device='cpu', disable_pbar=True)
words, ph = [], []
tmp = os.path.join(HERE, '_seg.wav')
for s, t in sp:
    x = a[max(0, s - 12) * H:min(n, t + 12) * H]
    with wave.open(tmp, 'wb') as o:
        o.setnchannels(1)
        o.setsampwidth(2)
        o.setframerate(SR)
        o.writeframes(x.tobytes())
    r = m.generate(input=tmp, disable_pbar=True)[0]
    toks = re.findall(r"[a-zA-Z@']+|[一-鿿]|\d", r.get('text', ''))
    ph.append([s * 10, t * 10, ''.join(toks)])
    if not toks:
        continue
    wt = [max(1.0, len(k) * 0.45) if re.match('[a-zA-Z]', k) else 1.0 for k in toks]
    tot = sum(wt)
    c = 0.0
    dur = (t - s) * 10
    for k, q in zip(toks, wt):
        words.append([int(s * 10 + dur * c / tot), int(s * 10 + dur * (c + q) / tot), k])
        c += q
os.remove(tmp)
json.dump(words, open(os.path.join(HERE, 'words.json'), 'w', encoding='utf-8'), ensure_ascii=False)
json.dump(ph, open(os.path.join(HERE, 'phrases.json'), 'w', encoding='utf-8'), ensure_ascii=False)
open(os.path.join(HERE, 'words.txt'), 'w', encoding='utf-8').write(' '.join(x[2] for x in words))
print('words', len(words))
