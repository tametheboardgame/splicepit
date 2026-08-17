import { GAME_WIDTH, GAME_HEIGHT, PALETTE, TEXT } from '../config.js';
import { ENEMY_CREATURES } from '../data/animals.js';
import { gameState } from '../state/GameState.js';
import { saveGame } from '../systems/saveSystem.js';
import { createCombatant, isDefeated, resolveAttack, resolveTrait } from '../systems/battleSystem.js';
import { addButton, addNoiseLines, wrappedText } from '../ui/helpers.js';
import { drawCreature } from '../render/CreatureRenderer.js';

export class BattleScene extends Phaser.Scene {
  constructor(){ super('Battle'); }

  create(){
    if(!gameState.currentCreature){ this.scene.start('Lab'); return; }
    this.player=createCombatant(gameState.currentCreature);
    const enemyData=ENEMY_CREATURES.pit_scrap;
    this.enemy=createCombatant({...enemyData, genes:enemyData.genes},enemyData.name);
    this.busy=false; this.finished=false;
    this.cameras.main.setBackgroundColor(PALETTE.paperDeep); this.drawPit(); addNoiseLines(this,100,.06);
    this.add.text(46,28,'FIT PIT / DEMONSTRATION BOUT',{...TEXT.mono,fontSize:'11px',color:'#a0573d'});
    this.add.text(46,50,'If it can stand, it can fight.',{...TEXT.title,fontSize:'32px'});
    drawCreature(this,275,285,gameState.currentCreature,{scale:1.2});
    drawCreature(this,710,275,{...enemyData,mutation:null},{scale:1.15,flip:true,enemy:true});
    this.playerName=this.add.text(76,132,this.player.name,{...TEXT.title,fontSize:'21px'});
    this.enemyName=this.add.text(585,132,this.enemy.name,{...TEXT.title,fontSize:'21px'});
    this.playerHp=this.add.text(78,163,'',{...TEXT.mono,fontSize:'11px'});
    this.enemyHp=this.add.text(587,163,'',{...TEXT.mono,fontSize:'11px'});
    this.log=wrappedText(this,70,390,'The bell rings. The licensing clerk looks away.',820,{fontSize:'16px',lineSpacing:4});
    this.attackBtn=addButton(this,185,500,200,'ATTACK',()=>this.takeTurn('attack'),{accent:PALETTE.rust});
    this.traitBtn=addButton(this,480,500,200,'USE TRAIT',()=>this.takeTurn('trait'),{accent:PALETTE.acid});
    this.guardBtn=addButton(this,775,500,200,'BRACE',()=>this.takeTurn('guard'),{accent:PALETTE.moss});
    this.updateHud();
  }

  drawPit(){
    const g=this.add.graphics(); g.fillStyle(0x383128,1); g.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);
    g.fillStyle(0x555044,.55); g.fillEllipse(480,300,850,310); g.lineStyle(7,PALETTE.bone,.28); g.strokeEllipse(480,300,850,310);
    g.lineStyle(2,PALETTE.rust,.25); for(let i=0;i<18;i++){ const a=(Math.PI*2/18)*i; g.lineBetween(480+Math.cos(a)*370,300+Math.sin(a)*130,480+Math.cos(a)*425,300+Math.sin(a)*155); }
    g.fillStyle(PALETTE.blood,.18); g.fillEllipse(512,318,230,60); g.fillEllipse(300,285,80,30);
  }

  updateHud(){
    this.playerHp.setText(`HP ${this.player.hp}/${this.player.stats.maxHp}`);
    this.enemyHp.setText(`HP ${this.enemy.hp}/${this.enemy.stats.maxHp}`);
  }

  takeTurn(action){
    if(this.busy||this.finished)return; this.busy=true;
    let first='';
    if(action==='attack') first=resolveAttack(this.player,this.enemy);
    if(action==='trait') first=resolveTrait(this.player,this.enemy);
    if(action==='guard'){ this.player.guarding=true; first=`${this.player.name} braces against the next hit.`; }
    this.updateHud(); this.log.setText(first);
    if(isDefeated(this.enemy)){ this.finish(true); return; }
    this.time.delayedCall(650,()=>{
      const enemyAction=Math.random()<.28 ? 'trait':'attack';
      const second=enemyAction==='trait' ? resolveTrait(this.enemy,this.player) : resolveAttack(this.enemy,this.player);
      this.log.setText(`${first}\n${second}`); this.updateHud();
      if(isDefeated(this.player)) this.finish(false); else this.busy=false;
    });
  }

  finish(won){
    this.finished=true; this.busy=false;
    if(won){
      gameState.recordWin(30); saveGame();
      this.log.setText(`HOUSE CREATURE DOWN.\n\nDemonstration bout recorded. £30 purse transferred directly against the pit debt. A deeply unimpressed clerk stamps your temporary licence.`);
      this.cameras.main.flash(220,183,200,108,false);
    } else {
      this.log.setText('YOUR CREATURE IS DOWN.\n\nThe Fit Pit returns it alive enough to try again. No purse. No sympathy.');
    }
    this.time.delayedCall(850,()=>{
      addButton(this,480,500,300,won?'RETURN TO YOUR PIT':'TRY AGAIN',()=>{ if(won) this.scene.start('Lab'); else this.scene.restart(); },{accent:won?PALETTE.acid:PALETTE.rust});
    });
  }
}
