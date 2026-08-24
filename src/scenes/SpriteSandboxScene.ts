import Phaser from 'phaser';

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 96;
const SPEED = 190;

const CHARACTERS = [
  { id: 'milo', sheetTexture: 'sandbox-sheet-milo', path: 'assets/protagonists/milo-hd-v2.png' },
  { id: 'theo', sheetTexture: 'sandbox-sheet-theo', path: 'assets/protagonists/theo-hd-v2.png' },
  { id: 'ada', sheetTexture: 'sandbox-sheet-ada', path: 'assets/protagonists/ada-hd-v2.png' },
  { id: 'pip', sheetTexture: 'sandbox-sheet-pip', path: 'assets/protagonists/pip-hd-v2.png' },
] as const;

type Direction = 'down' | 'left' | 'right' | 'up';

const DIRECTION_ROW: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

function directionTextureKey(characterId: string, direction: Direction): string {
  return `sandbox-${characterId}-${direction}`;
}

export class SpriteSandboxScene extends Phaser.Scene {
  player!: Phaser.GameObjects.Sprite;

  private direction: Direction = 'down';
  private characterIndex = 0;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
    four: Phaser.Input.Keyboard.Key;
    reset: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('SpriteSandbox');
  }

  preload(): void {
    for (const character of CHARACTERS) {
      // Load each approved sheet as a plain image. No spritesheet parser is used.
      this.load.image(character.sheetTexture, character.path);
    }
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#000000');

    this.createStandaloneDirectionalTextures();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      w: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      one: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      two: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      three: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      four: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      reset: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    };

    const centre = this.cameras.main.midPoint;
    this.player = this.add.sprite(
      centre.x,
      centre.y + FRAME_HEIGHT / 2,
      directionTextureKey(CHARACTERS[0].id, 'down'),
    ).setOrigin(0.5, 1);
  }

  update(_time: number, delta: number): void {
    this.handleCharacterSwitch();

    if (Phaser.Input.Keyboard.JustDown(this.keys.reset)) {
      const centre = this.cameras.main.midPoint;
      this.player.setPosition(centre.x, centre.y + FRAME_HEIGHT / 2);
    }

    let dx = 0;
    let dy = 0;
    let nextDirection: Direction | null = null;

    if (this.cursors.left.isDown || this.keys.a.isDown) {
      dx = -1;
      nextDirection = 'left';
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      dx = 1;
      nextDirection = 'right';
    } else if (this.cursors.up.isDown || this.keys.w.isDown) {
      dy = -1;
      nextDirection = 'up';
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      dy = 1;
      nextDirection = 'down';
    }

    if (nextDirection) {
      if (nextDirection !== this.direction) {
        this.direction = nextDirection;
        this.applyCurrentTexture();
      }

      const distance = SPEED * (delta / 1000);
      this.player.x += dx * distance;
      this.player.y += dy * distance;

      const halfWidth = FRAME_WIDTH / 2;
      this.player.x = Phaser.Math.Clamp(this.player.x, halfWidth, this.scale.width - halfWidth);
      this.player.y = Phaser.Math.Clamp(this.player.y, FRAME_HEIGHT, this.scale.height);
    }
  }

  private createStandaloneDirectionalTextures(): void {
    for (const character of CHARACTERS) {
      const sourceTexture = this.textures.get(character.sheetTexture);
      const sourceImage = sourceTexture.getSourceImage() as CanvasImageSource;

      for (const direction of ['down', 'left', 'right', 'up'] as const) {
        const key = directionTextureKey(character.id, direction);
        if (this.textures.exists(key)) continue;

        const canvasTexture = this.textures.createCanvas(key, FRAME_WIDTH, FRAME_HEIGHT);
        if (!canvasTexture) throw new Error(`Could not create sandbox texture ${key}`);

        const context = canvasTexture.context;
        context.clearRect(0, 0, FRAME_WIDTH, FRAME_HEIGHT);
        context.imageSmoothingEnabled = false;
        context.drawImage(
          sourceImage,
          0,
          DIRECTION_ROW[direction] * FRAME_HEIGHT,
          FRAME_WIDTH,
          FRAME_HEIGHT,
          0,
          0,
          FRAME_WIDTH,
          FRAME_HEIGHT,
        );
        canvasTexture.refresh();
        canvasTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    }
  }

  private applyCurrentTexture(): void {
    const character = CHARACTERS[this.characterIndex];
    this.player.setTexture(directionTextureKey(character.id, this.direction));
  }

  private handleCharacterSwitch(): void {
    const requested = [
      Phaser.Input.Keyboard.JustDown(this.keys.one),
      Phaser.Input.Keyboard.JustDown(this.keys.two),
      Phaser.Input.Keyboard.JustDown(this.keys.three),
      Phaser.Input.Keyboard.JustDown(this.keys.four),
    ].findIndex(Boolean);

    if (requested < 0 || requested === this.characterIndex) return;

    this.characterIndex = requested;
    this.applyCurrentTexture();
  }
}
