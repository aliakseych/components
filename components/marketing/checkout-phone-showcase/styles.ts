/** Poster state is the plain style (phone up, notification shown); keyframes override it, so reduced motion shows the poster. */
const items = [0, 1, 2, 3]
  .map((i) => {
    const s = ((0.1 + 0.08 * i) / 8) * 100;
    const e = s + (0.75 / 8) * 100;
    return `@keyframes cps-item-${i}{0%,${s.toFixed(2)}%{opacity:0;transform:translateY(70px);animation-timing-function:cubic-bezier(.165,.84,.44,1)}${e.toFixed(2)}%,100%{opacity:1;transform:none}}
.cps-item-${i}{animation:cps-item-${i} 8s linear infinite both}`;
  })
  .join("\n");

export const SCENE_CSS = `
.cps-scene{width:1260px;height:504px}
.cps-scene>*{position:absolute}
.cps-grid,.cps-card,.cps-checkout,.cps-thumb{opacity:0}
.cps-glow{left:70px;top:200px;width:1120px;height:304px;opacity:1;background:radial-gradient(ellipse 50% 100% at 50% 100%,color-mix(in oklab,var(--cps-glow) 75%,transparent) 0%,color-mix(in oklab,var(--cps-glow) 38%,transparent) 40%,transparent 75%);filter:blur(8px)}
.cps-phone-slot{left:0;top:0;width:1260px;height:504px;pointer-events:none}
.cps-phone{position:absolute;left:457px;top:0;width:346px;height:720px;transform:translateY(117px)}
.cps-notif{opacity:1}
.cps-grid{left:144px;top:34px;width:972px;height:436px}
.cps-wrap{position:absolute;inset:0;border-radius:28px;clip-path:inset(0 round 28px)}
.cps-paper{position:absolute;inset:0;background:var(--cps-paper)}
.cps-card{left:0;top:0;width:257px;height:423px;transform:translate(522px,47px)}
.cps-checkout{left:453px;top:149px;width:353px;height:223px}
.cps-thumb{left:475px;top:175px;width:92px;height:108px}
.cps-co-text{opacity:0}
${items}
.cps-scene[data-state=paused] *{animation-play-state:paused!important}
@media (prefers-reduced-motion:no-preference){
.cps-wrap{animation:cps-wrap 8s linear infinite both}
.cps-paper{animation:cps-paper 8s linear infinite both}
.cps-grid{animation:cps-grid 8s linear infinite both}
.cps-card{animation:cps-card 8s linear infinite both}
.cps-checkout{animation:cps-checkout 8s linear infinite both}
.cps-co-text{animation:cps-cotext 8s linear infinite both}
.cps-thumb{animation:cps-thumb 8s linear infinite both}
.cps-phone{animation:cps-phone 8s linear infinite both}
.cps-glow{animation:cps-glow 8s linear infinite both}
.cps-notif{animation:cps-notif 8s linear infinite both}
}
@media (prefers-reduced-motion:reduce){.cps-item-0,.cps-item-1,.cps-item-2,.cps-item-3{animation:none}}
@keyframes cps-wrap{0%{clip-path:inset(203px 279px 203px 279px round 14px);animation-timing-function:cubic-bezier(.165,.84,.44,1)}6.25%{clip-path:inset(14px 24px 14px 24px round 24px);animation-timing-function:ease-out}12.5%,100%{clip-path:inset(0 round 28px)}}
@keyframes cps-paper{0%{opacity:.5}6.25%{opacity:.65}12.5%,100%{opacity:1}}
@keyframes cps-grid{0%,21.25%{opacity:1;transform:none;filter:brightness(1);animation-timing-function:cubic-bezier(.33,1,.68,1)}25%,32.5%{opacity:1;transform:scale(.88);filter:brightness(.6);animation-timing-function:ease-in}37.5%{opacity:.7;transform:scale(.5);filter:brightness(.5)}42.5%,100%{opacity:0;transform:scale(.45);filter:brightness(.5)}}
@keyframes cps-card{0%,20.6%{opacity:0;transform:translate(826px,16px) scale(.794);animation-timing-function:ease-out}22.5%{opacity:1;animation-timing-function:cubic-bezier(.33,1,.68,1)}25%,32.5%{opacity:1;transform:translate(522px,47px);animation-timing-function:ease-in}40%,100%{opacity:0;transform:translate(522px,47px) scale(.7)}}
@keyframes cps-checkout{0%,33.75%{opacity:0;transform:scale(1.15);animation-timing-function:cubic-bezier(.33,1,.68,1)}42.5%,50%{opacity:1;transform:none;animation-timing-function:cubic-bezier(.65,0,.35,1)}56.25%{opacity:1;transform:translate(-312px,89px) scale(.76);animation-timing-function:ease-in}62.5%,100%{opacity:0;transform:translate(-340px,110px) scale(.7)}}
@keyframes cps-cotext{0%,43.75%{opacity:0}50%,100%{opacity:1}}
@keyframes cps-thumb{0%,35%{opacity:0;transform:scale(.6);animation-timing-function:cubic-bezier(.33,1,.68,1)}41.25%,50%{opacity:1;transform:none;animation-timing-function:cubic-bezier(.33,1,.68,1)}56.25%{opacity:1;transform:translate(38px,-146px) rotate(8deg) scale(1.15);animation-timing-function:ease-in-out}62.5%{opacity:1;transform:translate(82px,-109px) rotate(-8deg) scale(1.1);animation-timing-function:ease-in}66.25%{opacity:.9;transform:translate(82px,-39px) rotate(-8deg) scale(.8)}68.75%,100%{opacity:0;transform:translate(82px,-29px) rotate(-8deg) scale(.3)}}
@keyframes cps-phone{0%,50%{transform:translateY(520px);animation-timing-function:ease-in}56.25%{transform:translateY(438px);animation-timing-function:cubic-bezier(.33,1,.68,1)}62.5%{transform:translateY(213px);animation-timing-function:cubic-bezier(.33,1,.68,1)}68.75%{transform:translateY(139px);animation-timing-function:cubic-bezier(.33,1,.68,1)}75%,89.4%{transform:translateY(117px);animation-timing-function:ease-in-out}93.75%{transform:translateY(241px);animation-timing-function:ease-in}99.4%,100%{transform:translateY(520px)}}
@keyframes cps-glow{0%,50%{opacity:0;animation-timing-function:ease-out}68.75%,92.5%{opacity:1;animation-timing-function:ease-in}98.75%,100%{opacity:0}}
@keyframes cps-notif{0%,71.25%{opacity:0;transform:translateY(18px) scale(.96);animation-timing-function:cubic-bezier(.33,1,.68,1)}75%,100%{opacity:1;transform:none}}
`;
