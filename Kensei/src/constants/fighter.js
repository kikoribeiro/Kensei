// constante para a direção do Fighter
export const FighterDirection = {
  LEFT: -1,
  RIGHT: 1,
};

// constante que tem todo o tipo de estados do Fighter, moves, andar, victory...
export const FighterState = {
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
