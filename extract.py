import urllib.request
import re

try:
    req = urllib.request.Request('https://www.meta.ai/media-share/HF4GUMeg9Kp?utm_source=android_meta_ai_sl&open_in_meta_ai=true', headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    urls = re.findall(r'https://[^\s\"\']+\.mp4[^\s\"\']*', html)
    if urls:
        video_url = urls[0].replace(r'\u0026', '&')
        print("Downloading from:", video_url[:50], "...")
        urllib.request.urlretrieve(video_url, 'assets/entrance_video.mp4')
        print("Downloaded to assets/entrance_video.mp4")
except Exception as e:
    print(e)
