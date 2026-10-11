"""Original Super Elly score and sound effects, synthesized without external samples."""
import numpy as np, wave, subprocess
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'public/superelly/audio'
OUT.mkdir(parents=True,exist_ok=True)
SR=22050
rng=np.random.default_rng(23)
def note(midi,duration,volume=.2,voice='bell'):
 t=np.arange(int(SR*duration))/SR; f=440*2**((midi-69)/12)
 if voice=='bell': y=(np.sin(2*np.pi*f*t)+.28*np.sin(2*np.pi*f*2*t)+.1*np.sin(2*np.pi*f*3*t))*np.exp(-t*5)
 elif voice=='bass':y=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*2*t))*np.exp(-t*4)
 else:y=(np.sin(2*np.pi*f*t)+.12*np.sin(2*np.pi*f*2*t))*np.minimum(t/.05,1)*np.exp(-t*2)
 return y*volume*np.minimum(t/.008,1)*np.minimum((duration-t)/.04,1)
def save(name,y):
 y=np.clip(y,-.95,.95); p=OUT/(name+'.wav')
 with wave.open(str(p),'wb')as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((y*32767).astype('<i2').tobytes())
 return p
def add(y,s,at):
 i=int(at*SR);n=min(len(s),len(y)-i)
 if n>0:y[i:i+n]+=s[:n]
beat=60/108; length=32*beat; y=np.zeros(round(SR*length))
melody=[[76,79,81,79,74,76,72,74],[77,81,79,76,74,72,74,76],[79,83,81,79,76,74,72,76],[74,77,79,77,74,71,72,74],[76,79,84,81,79,76,74,72],[77,81,84,81,79,77,76,74],[79,76,74,72,74,76,79,74],[77,74,71,74,76,74,72,72]]
chords=[[48,52,55],[53,57,60],[48,52,55],[55,59,62],[57,60,64],[53,57,60],[55,59,62],[48,52,55]]
for bar,notes in enumerate(melody):
 for n,m in enumerate(notes):add(y,note(m,beat*.85,.19,'bell'),(bar*4+n*.5)*beat)
 for k in range(8):add(y,note(chords[bar][k%3]+12,beat,.07,'flute'),(bar*4+k*.5)*beat)
 for k in [0,2]:add(y,note(chords[bar][0],beat*1.5,.21,'bass'),(bar*4+k)*beat)
 for k in [1,3]:
  t=np.arange(int(.07*SR))/SR;add(y,rng.normal(0,1,len(t))*np.exp(-t*75)*.04,(bar*4+k)*beat)
y*=.8/max(.8,np.max(np.abs(y))); p=save('bakery-theme',y)
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(p),'-codec:a','libmp3lame','-b:a','96k',str(OUT/'bakery-theme.mp3')],check=True);p.unlink()
for name,notes in {'cookie':[84,88,91],'jump':[67,74,79],'hit':[48,43],'acro':[72,79,84],'special':[60,67,72,76,79,84,91],'hurt':[55,50,43],'throw':[62,58],'learn':[72,76,79,84],'win':[72,76,79,84,79,84,88]}.items():
 gap=.07 if name!='special' else .12; y=np.zeros(int((len(notes)*gap+.35)*SR))
 for i,m in enumerate(notes):add(y,note(m,.35,.32,'bell' if name in ['cookie','learn','win'] else 'bass'),i*gap)
 save(name,y)
t=np.arange(int(.15*SR))/SR; save('flash',(np.sin(2*np.pi*(780*t+180*t*t))*.15+rng.normal(0,1,len(t))*.025)*np.exp(-t*20))
print('Original looping score and 10 sound effects created.')
