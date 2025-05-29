export const FighterDirection = {
  LEFT: -1,
  RIGHT: 1,
};

export const FighterState = {
  // Basic states
  STANCE: "stance",
  WALK_FORWARD: "walk_forward",
  WALK_BACKWARDS: "walk_backwards",
  JUMP: "jump",
  JUMP_FRONT: "jump_front",
  CROUCH: "crouch",

  // Attack states
  PUNCH: "punch",
  KICK: "kick",
  CROUCH_PUNCH: "crouch_punch",
  CROUCH_KICK: "crouch_kick",
  UPPERCUT: "uppercut",
  SPECIAL_MOVE: "special_move",

  // Reaction states
  HIT: "hit",
  CROUCH_HIT: "crouch_hit",

  // Special states
  VICTORY: "victory",
  DEAD: "dead",
  TURN: "turn",
  FACE: "face",
  NAME: "name",
};

export const AIState = {
  IDLE: "idle",
  AGGRESSIVE: "aggressive",
  DEFENSIVE: "defensive",
  ATTACKING: "attacking",
};

export const FighterStats = {
  DEFAULT_HEALTH: 100,
  DEFAULT_SPEED: 5,
  DEFAULT_JUMP_SPEED: -18,
  DEFAULT_GRAVITY: 0.6,
};
