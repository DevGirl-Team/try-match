import Phaser from "phaser";

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
      debug: true,
    },
  },
  scene: {
    key: "main",
    preload: preload,
    create: create,
    update: update,
  },
  parent: document.querySelector("#game"),
};

let currentUser;
let currentLevel;
let gameLevels;
let userGamesLevels;

var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer, coinLayer, flowerLayer;
var score = 0;
var text;
const deadModal = document.querySelector('#dead-modal');

(async () => {
  // Get user
  const userLocalData = window.localStorage.getItem("trymatchdevgirl");
  if (userLocalData) {
    currentUser = JSON.parse(userLocalData);

    // Get game levels
    const getGameLevelsRes = await fetch(
      `http://localhost:8000/api/gameLevels`
    );
    const getGameLevelsData = await getGameLevelsRes.json();
    gameLevels = getGameLevelsData.data;
    console.log(getGameLevelsData);

    // Get user game level
    const getUserGameLevelsRes = await fetch(
      `http://localhost:8000/api/userGameLevels/user/${currentUser.id}`
    );
    const getUserGameLevelsData = await getUserGameLevelsRes.json();
    userGamesLevels = getUserGameLevelsData.data;

    // If level 1
    if (getUserGameLevelsData.data.lenght === 0) {
      currentLevel = gameLevels[0]
    }
    else {}
  }
  else {
    window.location.replace("/");
  }
})();

function hideDeadModal() {
  deadModal.classList.remove('hidden');
  deadModal.classList.add('flex')
}

function collectCoin(sprite, tile) {
  coinLayer.removeTileAt(tile.x, tile.y); // remove the tile/coin
  score++; // increment the score
  text.setText(score); // set the text to show the current score
  return false;
}

function preload() {
  // map made with Tiled in JSON format
  this.load.tilemapTiledJSON("map", "/assets/map2.json");
  // tiles in spritesheet
  this.load.spritesheet("tiles", "/assets/tiles.png", {
    frameWidth: 70,
    frameHeight: 70,
  });
  // simple coin image
  this.load.image("coin", "/assets/coinGold.png");
  // player animations
  this.load.atlas("player", "/assets/player.png", "/assets/player.json");
  // bad flower
  this.load.image("flower", "/assets/flower.png");
}

function create() {
  // load the map
  map = this.make.tilemap({ key: "map" });

  // tiles for the ground layer
  var groundTiles = map.addTilesetImage("tiles");
  // create the ground layer
  groundLayer = map.createDynamicLayer("World", groundTiles, 0, 0);
  // the player will collide with this layer
  groundLayer.setCollisionByExclusion([-1]);
  // set the boundaries of our game world
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;

  // create the player sprite
  player = this.physics.add.sprite(200, 200, "player");
  player.setBounce(0.2); // our player will bounce from items
  player.setCollideWorldBounds(true); // don't go out of the map

  this.physics.add.collider(groundLayer, player);

  cursors = this.input.keyboard.createCursorKeys();

  // set bounds so the camera won't go outside the game world
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  // make the camera follow the player
  this.cameras.main.startFollow(player);

  // set background color, so the sky is not black
  this.cameras.main.setBackgroundColor("#ccccff");

  this.anims.create({
    key: "walk",
    frames: this.anims.generateFrameNames("player", {
      prefix: "p1_walk",
      start: 1,
      end: 11,
      zeroPad: 2,
    }),
    frameRate: 10,
    repeat: -1,
  });

  // idle with only one frame, so repeat is not neaded
  this.anims.create({
    key: 'idle',
    frames: [{ key: 'player', frame: 'p1_stand' }],
    frameRate: 10,
  });

  // coin image used as tileset
  var coinTiles = map.addTilesetImage("coin");
  // add coins as tiles
  coinLayer = map.createDynamicLayer("Coins", coinTiles, 0, 0);

  coinLayer.setTileIndexCallback(17, collectCoin, this); // the coin id is 17
  // when the player overlaps with a tile with index 17, collectCoin will be called
  this.physics.add.overlap(player, coinLayer);

  text = this.add.text(20, 570, "0", {
    fontSize: "20px",
    fill: "#ffffff",
  });
  text.setScrollFactor(0);
}

function update(time, delta) {
  if (cursors.left.isDown) {
    player.body.setVelocityX(-200);
    player.anims.play('walk', true); // walk left
    player.flipX = true; // flip the sprite to the left
  }
  else if (cursors.right.isDown) {
    player.body.setVelocityX(200);
    player.anims.play('walk', true);
    player.flipX = false; // use the original sprite looking to the right
  } else {
    player.body.setVelocityX(0);
    player.anims.play('idle', true);
  }
  // jump 
  if (cursors.up.isDown && player.body.onFloor()) {
    player.body.setVelocityY(-500);
  }
}
