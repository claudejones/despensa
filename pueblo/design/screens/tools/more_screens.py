# Writes the second batch of boards: pronunciation drawer, the remaining screens, and one signature challenge per place.
import json, subprocess, re, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'project'))
icons = json.loads(subprocess.check_output(['node','-e','''
global.window={};global.document={readyState:"loading",addEventListener(){},querySelectorAll(){return[]}};
const fs=require("fs"),os=require("os"),path=require("path");const t=path.join(os.tmpdir(),"pb.cjs");fs.copyFileSync("../../system/project/components/bundle.js",t);require(t);
console.log(JSON.stringify(window.Pueblo.icons))''']))
def svg(n,size=24,sw=2): return '<svg class="pb-ic" width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="%s" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'%(size,size,sw,icons[n])
E={'neutral':'3b6f2014454f0badca36a53b9745db2f','talking':'d2a0c215f7af7c06c06cff3a70b1dd61','happy':'1c8bd78eb738e97d7e7cab88e01bf6d8','confused':'781ee5cedc3d7b6017b7ffb5dd9e5c2c','impatient':'eeefc2dd652bb8786ac2ba77db776edc','surprised':'5f0f9778389b6e939d840b46db621a48'}
TOWN='/_blob/b0c7374b99e171168d51861798f64b5c'
P={'limon':'c2c2ece97dd2d7b3230162525e6dabe2','zanahoria':'0a7ae3182b04fff94c595dbf2c068fd4','platano':'f5cb37b2fd57cac060502b44155aeafc','tomate':'5ab4138e80844dfb92eb10bad5307b75'}
HEAD='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>%s</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="ds/pueblo/tokens.css">
<link rel="stylesheet" href="ds/pueblo/components/bundle.css">
</head>
<body>
<x-dc>
<helmet>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Lilita+One&display=swap" rel="stylesheet">
<style>
body{margin:0}
a{color:#1F1B16}a:hover{color:#1B3FB5}
</style>
</helmet>
<div class="pb" style="width: 390px; height: 844px; box-sizing: border-box; background: var(--cal); display: flex; flex-direction: column; overflow: hidden; position: relative">
'''
FOOT='''</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":390,"height":844}}'>
class Component extends DCLogic {
renderVals() {
return {};
}
}
</script>
</body>
</html>
'''
def page(name,title,body): open(name+'.dc.html','w').write(HEAD%title+body+FOOT)
COINS='<span class="pb-chip pb-chip--coins">'+svg('coins',18)+'$120</span>'
def topbar(title,back='TownMap',label='Back to town',plain=False,end=COINS):
    return ('  <header class="pb-topbar">\n'+('    <a class="pb-iconbtn" href="%s.dc.html" aria-label="%s">%s</a>\n'%(back,label,svg('chevron-left')) if back else '')+
     '    <h1 class="pb-topbar__title%s"%s>%s</h1>\n    <div class="pb-topbar__end">%s</div>\n  </header>\n'%(' pb-topbar__title--plain' if plain else '','' if back else ' style="padding-left: 12px"',title,end))
def steps(n,of): return '  <div style="padding: 0 16px 10px"><div class="pb-progress pb-progress--steps" style="height: 8px" role="img" aria-label="Step %d of %d">%s</div></div>\n'%(n,of,''.join('<i%s></i>'%(' class="on"' if i<n else '') for i in range(of)))
def patience(left): return '      <span class="pb-encounter__hud pb-patience" role="img" aria-label="Patience %d of 5">%sPatience<span class="pb-patience__pips">%s</span></span>\n'%(left,svg('timer',18),''.join('<i%s></i>'%('' if i<left else ' class="off"') for i in range(5)))
def encounter(place,who,es,en,face=None,tall=False,pat=None,subs=True):
    img=('      <img class="pb-px pb-encounter__who" src="/_blob/%s" alt="%s, %s" style="width: 117px; height: 124px">\n'%(E[face],who,face)) if face else '      <div class="pb-encounter__who pb-encounter__who--blank" role="img" aria-label="%s, portrait to come"></div>\n'%who
    return ('  <div style="padding: 0 16px 14px">\n    <div class="pb-encounter%s" data-place="%s">\n'%(' pb-encounter--tall' if tall else '',place)+img+
      '      <div class="pb-dialogue"%s>\n        <p class="pb-dialogue__who">%s</p>\n        <p class="pb-dialogue__es">%s</p>\n%s      </div>\n'%('' if subs else ' data-subtitles="off"',who,es,'        <p class="pb-dialogue__en">%s</p>\n'%en if en else '')+
      '      <button class="pb-iconbtn pb-iconbtn--tonal pb-encounter__say" aria-label="Hear it again">%s</button>\n'%svg('volume-2')+(patience(pat) if pat else '')+'    </div>\n  </div>\n')
ABC='<button class="pb-iconbtn pb-iconbtn--tonal pb-iconbtn--lg" aria-label="How the words sound"><span class="title" aria-hidden="true">Abc</span></button>'
HINT='<button class="pb-iconbtn pb-iconbtn--tonal pb-iconbtn--lg" aria-label="Hint, costs 5 pesos">%s</button>'%svg('lightbulb')
def footer(label,href,tools=True,second=None):
    return ('  <div style="padding: 0 16px 24px; display: flex; gap: 8px; align-items: center">\n'+('    '+HINT+'\n    '+ABC+'\n' if tools else '')+
            '    <a class="pb-btn" href="%s.dc.html" style="text-decoration: none; box-sizing: border-box; flex: 1">%s</a>\n  </div>\n'%(href,label))
def body(inner,gap=12): return '  <div style="flex: 1; padding: 0 16px 12px; display: flex; flex-direction: column; gap: %dpx; min-height: 0">\n%s  </div>\n'%(gap,inner)
def tiles(ws,label='Your words'): return '    <div class="pb-tray">\n      <span class="pb-tray__label">%s</span>\n%s\n    </div>\n'%(label,'\n'.join('      <button class="pb-tile">%s</button>'%w for w in ws))
def row(pic,en,slot,qty=None):
    return '      <div class="pb-listrow">%s<span class="pb-listrow__en">%s%s</span>%s</div>\n'%(pic,en,'<span class="pb-listrow__qty">%s</span>'%qty if qty else '',slot)
def art(k,w,h): return '<span class="pb-listrow__pic pb-listrow__pic--art"><img class="pb-px" src="/_blob/%s" alt="" style="width: %dpx; height: %dpx"></span>'%(P[k],w,h)
def ic(n): return '<span class="pb-listrow__pic">%s</span>'%svg(n)
EMPTY='<span class="pb-slot" aria-label="Empty"></span>'
def sound(syls,stress,say,word): 
    return '      <div class="pb-sound"><div class="pb-sound__body"><div class="pb-syl">%s</div><p class="pb-sound__say">%s</p></div><button class="pb-iconbtn pb-iconbtn--tonal" aria-label="Hear %s">%s</button></div>\n'%(''.join('<i%s>%s</i>'%(' class="is-stress"' if i==stress else '',s) for i,s in enumerate(syls)),say,word,svg('volume-2'))
def sw(label,on): return '<label class="pb-switch"><input type="checkbox"%s aria-label="%s"><span class="pb-switch__track"></span><span class="pb-switch__handle"></span></label>'%(' checked' if on else '',label)
def setrow(icn,t,sub,ctrl): return '      <div class="pb-setrow" style="padding-left: 0; padding-right: 0">%s<div class="pb-setrow__body"><p class="pb-setrow__title">%s</p><p class="pb-setrow__text">%s</p></div>%s</div>\n'%(svg(icn),t,sub,ctrl)
X=svg('x')

# ---- Match gains the Abc button; build the drawer board from it
m=open('Match.dc.html').read()
old='''    <button class="pb-iconbtn pb-iconbtn--tonal pb-iconbtn--lg" aria-label="Hint, costs 5 pesos">'''
if 'How the words sound' not in m:
    i=m.index(old); j=m.index('</button>',i)+9
    m=m[:j]+'\n    '+ABC+m[j:]; open('Match.dc.html','w').write(m)
    for f in ['HintSheet','LeaveDialog','Quantity','Pay']:
        s=open(f+'.dc.html').read()
        if old in s and 'How the words sound' not in s:
            i=s.index(old); j=s.index('</button>',i)+9; s=s[:j]+'\n    '+ABC+s[j:]; open(f+'.dc.html','w').write(s)
m=open('Match.dc.html').read()
end='</div>\n</x-dc>'; assert m.count(end)==1
drawer='''  <div class="pb-overlay pb-overlay--bottom">
    <div class="pb-scrim"></div>
    <div class="pb-sheet" role="dialog" aria-label="How the words sound">
      <div class="pb-sheet__grab"><div class="pb-sheet__handle"></div></div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px">
        <h2 class="pb-sheet__title" style="flex: 1; margin: 0">Sounds</h2>
        <div class="pb-group" role="group" aria-label="Speed" style="width: 150px"><button class="pb-group__btn" aria-pressed="true">Slow</button><button class="pb-group__btn" aria-pressed="false">Normal</button></div>
        <button class="pb-iconbtn" aria-label="Close">'''+X+'''</button>
      </div>
      <p class="label" style="color: var(--ink-muted); margin-bottom: 4px">The dark part is the one you stress.</p>
'''+sound(['za','na','ho','rias'],2,'sah-nah-<b>OH</b>-ryahs','zanahorias')+sound(['to','ma','tes'],1,'toh-<b>MAH</b>-tehs','tomates')+sound(['plá','ta','nos'],0,'<b>PLAH</b>-tah-nohs','plátanos')+sound(['ce','bo','llas'],1,'seh-<b>BOH</b>-yahs','cebollas')+sound(['li','mo','nes'],1,'lee-<b>MOH</b>-nehs','limones')+'''    </div>
  </div>
'''
d=m.replace(end,drawer+end).replace('<title>Mercado: match the list</title>','<title>Mercado: how the words sound</title>')
d=d.replace('display: flex; flex-direction: column; overflow: hidden">','display: flex; flex-direction: column; overflow: hidden; position: relative">',1)
open('SoundDrawer.dc.html','w').write(d)

# ---- 3 Arrival
page('Arrival','Arrival', '''  <div style="height: 300px; overflow: hidden; display: flex; align-items: flex-end; justify-content: center; background: var(--wall-maya)">
    <img class="pb-px" src="'''+TOWN+'''" alt="The plaza of the town" style="width: 576px; height: 384px; flex: none">
  </div>
'''+'''  <div style="padding: 16px 16px 4px"><h1 class="headline">Your first morning in town</h1><p class="body" style="color: var(--ink-muted)">You have just moved here. Your neighbour stops to say hello.</p></div>
'''+encounter('mercado','Doña Carmen','¡Hola, vecina! ¿Es nueva aquí?','Hello, neighbour! Are you new here?','happy')+body('''    <p class="body">Pick a reply. Either one is fine.</p>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button class="pb-tile" style="justify-content: center; width: 100%; outline: 3px solid var(--cobalto); outline-offset: -3px">Sí, soy nueva. Mucho gusto.</button>
      <button class="pb-tile" style="justify-content: center; width: 100%">Perdón, no entiendo.</button>
    </div>
''')+footer('Say it','TownMap'))

# ---- 6 Street encounter (over the map)
t=open('TownMap.dc.html').read(); assert t.count(end)==1
street='''  <div class="pb-overlay pb-overlay--bottom">
    <div class="pb-scrim"></div>
    <div class="pb-sheet" role="dialog" aria-label="Someone greets you">
      <div class="pb-sheet__grab"><div class="pb-sheet__handle"></div></div>
      <p class="label" style="color: var(--ink-muted); margin-bottom: 8px">On the way to the Mercado</p>
      <div class="pb-encounter" data-place="plaza">
        <div class="pb-encounter__who pb-encounter__who--blank" role="img" aria-label="A passer-by, portrait to come"></div>
        <div class="pb-dialogue"><p class="pb-dialogue__who">Don Chucho</p><p class="pb-dialogue__es">¡Buenos días! ¿Cómo amaneció?</p><p class="pb-dialogue__en">Good morning! How did you wake up?</p></div>
        <button class="pb-iconbtn pb-iconbtn--tonal pb-encounter__say" aria-label="Hear it again">'''+svg('volume-2')+'''</button>
'''+patience(4)+'''      </div>
      <p class="body" style="margin: 20px 0 8px">What do you say back?</p>
      <div style="display: flex; flex-direction: column; gap: 8px">
        <button class="pb-tile" style="justify-content: center; width: 100%">Bien, gracias. ¿Y usted?</button>
        <button class="pb-tile" style="justify-content: center; width: 100%">¿Cuánto cuesta?</button>
        <button class="pb-tile" style="justify-content: center; width: 100%">A la derecha.</button>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; margin-top: 16px"><button class="pb-btn pb-btn--text">Just wave</button><span class="pb-chip pb-chip--coins" style="margin-left: auto">Earn $2</span></div>
    </div>
  </div>
'''
t2=t.replace(end,street+end).replace('<title>Town map</title>','<title>Street encounter</title>')
t2=t2.replace('display: flex; flex-direction: column; overflow: hidden">','display: flex; flex-direction: column; overflow: hidden; position: relative">',1)
open('StreetEncounter.dc.html','w').write(t2)

# ---- Typing
page('Typing','Mercado: type it', topbar('Mercado','PlaceHome','Leave this challenge')+steps(2,5)+encounter('mercado','Doña Carmen','¿Qué más le doy?','What else can I get you?','talking')+body('''    <div style="display: flex; align-items: center; gap: 12px">
      <span class="pb-listrow__pic pb-listrow__pic--art"><img class="pb-px" src="/_blob/'''+P['zanahoria']+'''" alt="" style="width: 40px; height: 41px"></span>
      <div><p class="title">carrots</p><p class="label" style="color: var(--ink-muted)">Type it in Spanish</p></div>
    </div>
    <label class="pb-field"><span class="pb-field__label" style="position: absolute; width: 1px; height: 1px; overflow: hidden">carrots, in Spanish</span><input class="pb-field__input" value="zanaho" autocomplete="off" autocapitalize="off" spellcheck="false" style="border-color: var(--cobalto); border-width: 3px"></label>
    <div class="pb-keys">
      <button class="pb-key">á</button><button class="pb-key">é</button><button class="pb-key">í</button><button class="pb-key">ó</button><button class="pb-key">ú</button><button class="pb-key">ñ</button><button class="pb-key">¿</button><button class="pb-key">¡</button>
    </div>
    <p class="label" style="color: var(--ink-muted)">Close is fine. If an accent is missing, you will see where it goes.</p>
''')+footer('Check','Typing'))

# ---- Sentence building
page('SentenceBuild','Mercado: build the sentence', topbar('Mercado','PlaceHome','Leave this challenge')+steps(3,5)+encounter('mercado','Doña Carmen','¿Qué va a llevar?','What would you like?','neutral')+body('''    <div><p class="label" style="color: var(--ink-muted)">Say this</p><p class="title">I would like half a kilo of limes, please.</p></div>
    <div class="pb-answer"><button class="pb-tile">Quisiera</button><button class="pb-tile">medio kilo</button><button class="pb-tile">de</button></div>
'''+tiles(['limones','por favor','un','tomates']))+footer('Check','SentenceBuild'))

# ---- Conversation (the check: no subtitles)
page('Conversation','Mercado: the check', topbar('Mercado','PlaceHome','Leave the check',end='<span class="pb-chip">'+svg('award',18)+'The check</span>')+steps(3,6)+encounter('mercado','Doña Carmen','¿Algo más?',None,'talking',pat=3,subs=False)+body('''    <div class="pb-chat">
      <div class="pb-bubble"><small>Doña Carmen</small>Aquí tiene sus limones.</div>
      <div class="pb-bubble pb-bubble--you"><small>You</small>Gracias.</div>
    </div>
    <p class="body" style="margin-top: 4px">You still need tomatoes. What do you say?</p>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button class="pb-tile" style="width: 100%">Sí, ¿a cómo el tomate?</button>
      <button class="pb-tile" style="width: 100%">Es todo, gracias.</button>
      <button class="pb-tile" style="width: 100%">No, es muy caro.</button>
    </div>
    <p class="label" style="color: var(--ink-muted)">Subtitles and hints are off during a check.</p>
''',10)+'''  <div style="padding: 0 16px 24px; display: flex; gap: 8px; align-items: center">
    '''+ABC+'''
    <a class="pb-btn" href="Results.dc.html" style="text-decoration: none; box-sizing: border-box; flex: 1">Say it</a>
  </div>
''')

# ---- Say it aloud
page('SayAloud','Mercado: say it aloud', topbar('Mercado','PlaceHome','Leave this challenge')+steps(4,5)+encounter('mercado','Doña Carmen','¿Qué va a llevar?','What would you like?','neutral')+body('''    <div><p class="label" style="color: var(--ink-muted)">Say this out loud</p><p class="word">Quisiera un kilo de tomates, por favor.</p><p class="label" style="color: var(--ink-muted)">I would like a kilo of tomatoes, please.</p></div>
    <div class="pb-card" style="padding: 8px 16px">
'''+sound(['Qui','sie','ra'],1,'kee-<b>SYEH</b>-rah','Quisiera')+sound(['to','ma','tes'],1,'toh-<b>MAH</b>-tehs','tomates')+'''    </div>
    <div style="display: flex; gap: 8px">
      <button class="pb-btn pb-btn--medium pb-btn--tonal" style="flex: 1">'''+svg('volume-2')+'''Hear it</button>
      <button class="pb-btn pb-btn--medium pb-btn--tonal" style="flex: 1">'''+svg('mic')+'''Record me</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 6px">
      <p class="title">How did it go?</p>
      <div class="pb-group" role="group" aria-label="How did it go">
        <button class="pb-group__btn" aria-pressed="false">'''+svg('frown',20)+'''Missed</button>
        <button class="pb-group__btn" aria-pressed="true">'''+svg('meh',20)+'''Almost</button>
        <button class="pb-group__btn" aria-pressed="false">'''+svg('smile',20)+'''Got it</button>
      </div>
    </div>
''',14)+footer('Next','SayAloud',tools=False))

# ---- 16 Two-player set-up
def player(n,name,form,role,icn):
    return '''    <div class="pb-card" style="display: flex; flex-direction: column; gap: 10px">
      <div style="display: flex; align-items: center; gap: 12px">'''+svg(icn)+'''<p class="title" style="flex: 1">Player '''+str(n)+''' · '''+role+'''</p><span class="pb-chip">'''+name+'''</span></div>
      <div class="pb-group" role="group" aria-label="Spanish forms for player '''+str(n)+'''"><button class="pb-group__btn" aria-pressed="'''+('true' if form=='o' else 'false')+'''">cansado · -o</button><button class="pb-group__btn" aria-pressed="'''+('true' if form=='a' else 'false')+'''">cansada · -a</button></div>
    </div>
'''
page('TwoPlayer','Two players', topbar('Two players','TownMap','Back to town',plain=True,end='')+body('''    <p class="body" style="color: var(--ink-muted)">One phone, two people. One of you is the customer and the other plays the vendor, reading her lines aloud. Then you swap.</p>
'''+player(1,'Alex','a','the customer','shopping-basket')+player(2,'Sam','o','the vendor','store')+'''    <div class="pb-card" style="padding: 0 16px">
'''+setrow('store','Where','The Mercado','<span class="pb-chip">Change</span>')+setrow('captions','English subtitles','Shown to the player whose turn it is.',sw('English subtitles',True))+'''    </div>
    <div class="pb-card pb-card--flat" style="display: flex; gap: 12px; align-items: center">'''+svg('rotate-ccw')+'''<p class="label">The game tells you when to pass the phone and when to swap roles.</p></div>
''')+footer('Start together','PlaceHome',tools=False))

# ---- 18 Pause (over Match)
pause='''  <div class="pb-overlay pb-overlay--bottom">
    <div class="pb-scrim"></div>
    <div class="pb-sheet" role="dialog" aria-label="Paused">
      <div class="pb-sheet__grab"><div class="pb-sheet__handle"></div></div>
      <h2 class="pb-sheet__title">Paused</h2>
      <p class="label" style="color: var(--ink-muted); margin: -8px 0 8px">Doña Carmen will wait. Patience stops while you are here.</p>
'''+setrow('volume-2','Sound','Voices and effects',sw('Sound',True))+setrow('captions','English subtitles','Show the English under what people say.',sw('English subtitles',True))+setrow('timer','Timed replies','People lose patience if you take too long.',sw('Timed replies',False))+'''      <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; margin-top: 16px">
        <button class="pb-btn">Carry on</button>
        <button class="pb-btn pb-btn--text">Leave this trip</button>
        <p class="label-small" style="color: var(--ink-muted)">Build v0.1 · design</p>
      </div>
    </div>
  </div>
'''
pz=m.replace(end,pause+end).replace('<title>Mercado: match the list</title>','<title>Paused</title>')
pz=pz.replace('display: flex; flex-direction: column; overflow: hidden">','display: flex; flex-direction: column; overflow: hidden; position: relative">',1)
open('Pause.dc.html','w').write(pz)

# ---- 19 Test panel
page('TestPanel','Test panel', topbar('Test panel','TownMap','Close the test panel',plain=True,end='<span class="pb-chip">Build v0.1</span>')+body('''    <p class="label" style="color: var(--ink-muted)">For testing only. Opened by five taps on the build label. Never in a public build.</p>
    <div class="pb-card" style="padding: 0 16px">
'''+setrow('map','Jump to','Any place, challenge or step','<span class="pb-chip">Mercado · Pay</span>')+setrow('sparkles','All words','Set every word to one state','<div class="pb-group" role="group" aria-label="All words" style="width: 150px"><button class="pb-group__btn" aria-pressed="false">New</button><button class="pb-group__btn" aria-pressed="false">Known</button></div>')+setrow('clock','Skip ahead','Make words come due','<span class="pb-chip">+3 days</span>')+setrow('coins','Pesos','Set your balance','<span class="pb-chip pb-chip--coins">$500</span>')+setrow('eye','Show answers','Mark the right tile',sw('Show answers',False))+setrow('timer','Patience never runs out','',sw('Patience never runs out',True))+setrow('zap','Speed','Run speech and motion faster','<div class="pb-group" role="group" aria-label="Speed" style="width: 130px"><button class="pb-group__btn" aria-pressed="true">×1</button><button class="pb-group__btn" aria-pressed="false">×2</button></div>')+'''    </div>
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button class="pb-btn pb-btn--small pb-btn--tonal">Win this step</button>
      <button class="pb-btn pb-btn--small pb-btn--tonal">Copy bug info</button>
      <button class="pb-btn pb-btn--small pb-btn--outline">Reset everything</button>
    </div>
''',10))

# ---- signature challenges for the other seven places
def pick(es,price,on=False): return '      <button class="pb-pick" aria-pressed="%s"><span class="pb-pick__mark">%s</span><span class="pb-pick__es">%s</span><span class="pb-pick__price">$%s</span></button>\n'%('true' if on else 'false',svg('check',14,3) if on else '',es,price)
page('Sitio','Sitio: tell the driver', topbar('Sitio')+steps(1,3)+encounter('sitio','Don Beto','¿A dónde lo llevo?','Where shall I take you?')+body('''    <div class="pb-card pb-card--flat" style="display: flex; align-items: center; gap: 12px">'''+svg('cross')+'''<div><p class="label" style="color: var(--ink-muted)">You need to get to</p><p class="title">the clinic, and you are in a hurry</p></div></div>
    <p class="body">Tell him where to go.</p>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button class="pb-tile" style="width: 100%">Al banco, por favor.</button>
      <button class="pb-tile" style="width: 100%; outline: 3px solid var(--cobalto); outline-offset: -3px">A la clínica, por favor. Tengo prisa.</button>
      <button class="pb-tile" style="width: 100%">A la escuela, despacio.</button>
    </div>
    <p class="label" style="color: var(--ink-muted)">Next: he tells you the fare, and you give him directions on the way.</p>
''')+footer('Say it','Sitio'))
page('Restaurante','Restaurante: order from the menu', topbar('Restaurante')+steps(1,3)+encounter('restaurante','Luis','¿Qué le traigo?','What can I bring you?')+body('''    <div class="pb-card pb-card--flat" style="display: flex; align-items: center; gap: 12px">'''+svg('utensils')+'''<div><p class="label" style="color: var(--ink-muted)">You want</p><p class="title">cactus tacos and a hibiscus water. No meat.</p></div></div>
    <div class="pb-list" style="gap: 0">
      <p class="label" style="color: var(--ink-muted); padding: 4px 12px 0">La carta</p>
'''+pick('Tacos al pastor','65')+pick('Tacos de nopal','60',True)+pick('Sopa de lima','70')+pick('Quesadilla de flor','55')+pick('Agua de jamaica','25')+'''    </div>
''')+footer('Order','Restaurante'))
page('Clinica','Clínica: say what hurts', topbar('Clínica')+steps(1,3)+encounter('clinica','Dra. Morales','¿Qué le duele?','What hurts?')+body('''    <p class="body">Drag the Spanish to what you need to tell her.</p>
    <div class="pb-list">
'''+row(ic('frown'),'My head hurts','<span class="pb-slot pb-slot--filled" style="font-size: 16px; line-height: 24px">Me duele la cabeza</span>')+row(ic('zap'),'I have a fever',EMPTY)+row(ic('clock'),'Since yesterday',EMPTY)+'''    </div>
'''+tiles(['Tengo fiebre','Desde ayer','Me duele el estómago','Desde hace una semana'],'What you can say'))+footer('Check','Clinica'))
page('Casa','Casa: plan the day', topbar('Casa')+steps(1,3)+encounter('casa','Lupita','¿Qué hago hoy?','What shall I do today?')+body('''    <p class="body">Drag what to ask her.</p>
    <div class="pb-list">
'''+row(ic('utensils'),'Clean the kitchen',EMPTY)+row(ic('house'),'Wash the sheets','<span class="pb-slot pb-slot--filled" style="font-size: 16px; line-height: 24px">Lave las sábanas</span>')+row(ic('x'),'Not the bathroom today',EMPTY)+'''    </div>
'''+tiles(['Limpie la cocina','El baño no, gracias','Barra la sala'],'What you can say'))+footer('Check','Casa'))
page('Plaza','Plaza: what time is it', topbar('Plaza')+steps(2,4)+encounter('plaza','Don Chucho','Disculpe, ¿qué hora es?','Excuse me, what time is it?',pat=4)+body('''    <div class="pb-card" style="display: flex; align-items: center; gap: 16px">
      <div style="width: 88px; height: 88px; border-radius: 999px; border: 4px solid var(--ink); position: relative; flex: none" role="img" aria-label="A clock showing half past three">
        <div style="position: absolute; left: 50%; top: 50%; width: 4px; height: 26px; margin: -24px 0 0 -2px; background: var(--ink); border-radius: 2px; transform-origin: 50% 24px; transform: rotate(105deg)"></div>
        <div style="position: absolute; left: 50%; top: 50%; width: 3px; height: 36px; margin: -34px 0 0 -1.5px; background: var(--ink); border-radius: 2px; transform-origin: 50% 34px; transform: rotate(180deg)"></div>
      </div>
      <div><p class="label" style="color: var(--ink-muted)">The plaza clock says</p><p class="headline">3:30</p></div>
    </div>
    <p class="body">Tell him the time.</p>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <button class="pb-tile" style="width: 100%">Son las tres y media.</button>
      <button class="pb-tile" style="width: 100%">Son las cuatro menos cuarto.</button>
      <button class="pb-tile" style="width: 100%">Es la una y media.</button>
    </div>
''')+footer('Say it','Plaza'))
page('Escuela','Escuela: sound it out', topbar('Escuela')+steps(2,5)+encounter('escuela','Maestra Elena','Vamos a separar en sílabas.',"Let's split it into syllables.")+body('''    <div><p class="label" style="color: var(--ink-muted)">The word</p><p class="headline">zanahoria</p></div>
    <p class="body">Put the parts in order, then tap the one you stress.</p>
    <div class="pb-answer" style="min-height: 72px"><button class="pb-tile">za</button><button class="pb-tile">na</button></div>
'''+tiles(['ria','ho','ha','no'],'The parts')+'''    <div class="pb-card pb-card--flat" style="display: flex; gap: 12px; align-items: center">'''+svg('lightbulb')+'''<p class="label">A word ending in a vowel is stressed on the part before last.</p></div>
''')+footer('Check','Escuela'))
page('Banco','Banco: key in the amount', topbar('Banco')+steps(1,4)+encounter('banco','Don Rafael','Su saldo es de mil doscientos cincuenta pesos.','Your balance is ··· pesos.',pat=5)+body('''    <p class="body">Key in the balance he told you.</p>
    <div class="pb-amount" aria-live="polite">12</div>
    <div class="pb-numpad" style="margin: 0 auto">
      <button class="pb-key">1</button><button class="pb-key">2</button><button class="pb-key">3</button>
      <button class="pb-key">4</button><button class="pb-key">5</button><button class="pb-key">6</button>
      <button class="pb-key">7</button><button class="pb-key">8</button><button class="pb-key">9</button>
      <span></span><button class="pb-key">0</button><button class="pb-key" aria-label="Delete">'''+svg('delete')+'''</button>
    </div>
''')+footer('Check','Banco'))

c=json.load(open('canvas.json'))
def put(names,y,x0=0,per=5):
    for i,(f,t) in enumerate(names):
        c['boards'][f+'.dc.html']={"x":x0+(i%per)*470,"y":y+(i//per)*964,"w":390,"h":844,"title":t,"radius":28}
        if f+'.dc.html' not in c['order']: c['order'].append(f+'.dc.html')
put([('SoundDrawer','Pronunciation drawer'),('Arrival','3 Arrival'),('StreetEncounter','6 Street encounter'),('Typing','9 Typing'),('SentenceBuild','9e Build a sentence'),('Conversation','9f Conversation (the check)'),('SayAloud','9g Say it aloud'),('TwoPlayer','16 Two-player set-up'),('Pause','18 Pause'),('TestPanel','19 Test panel')],4560)
put([('Sitio','Sitio · tell the driver'),('Restaurante','Restaurante · order from the menu'),('Clinica','Clínica · say what hurts'),('Casa','Casa · plan the day'),('Plaza','Plaza · what time is it'),('Escuela','Escuela · sound it out'),('Banco','Banco · key in the amount')],6768)
c['notes']['more']={"x":0,"y":4280,"text":"The rest of the game: help, new ways to answer, and the system screens","kind":"title1","maxW":2270}
c['notes']['places']={"x":0,"y":6488,"text":"One signature challenge for each of the other seven places","kind":"title1","maxW":2270}
c['notes']['portraits']={"x":940,"y":7732,"w":390,"text":"The dark blocks stand in for characters who have not been drawn yet. Only Doña Carmen has art so far.","size":"m","fill":"orange"}
json.dump(c,open('canvas.json','w'),indent=1,ensure_ascii=False); print(len(c['boards']),'boards')
