const stage = document.getElementById('stage');
const ctx = stage.getContext('2d');
const bg = document.getElementById('bg');
const bgCtx = bg.getContext('2d');

let currentTime = 0
, lastTime = (new Date()).getTime()
, dt = 0
, fps = 60
, interval = fps / 1000
, clrColor = 'black'
, state = {}
, spriteSheet = new Image();

const soul = {
    ACTIVE: 0,
    INACTIVE: 1,
    HELD: 2
};

const wraith = {
    WANDERING: 0,
    CHASING: 1,
    INACTIVE: 2
};

// tilemaps -- 40x30 at 20x20px
const tiles =
      [ 'grey' // floor
      , 'blue' // wall
      // gates
      , "rgba(255, 255, 255, 0.5)"
      , "rgba(0, 255, 0, 0.5)"
      , "rgba(0, 200, 200, 0.5)"
      , "rgba(200, 0, 120, 0.5)"
      ];

const tset = (m, x, y, v) => m[y * 40 + x] = v;
const tget = (m, x, y) => m[y * 40 + x];
const tdraw = m => {
    let [i, j] = [0, 0];
    while (j < 30) {
        while (i < 40) {
            let t = tget(m, i, j);
            if (t === 0) {
                ctx.drawImage(spriteSheet, 0, 20, 20, 20, i * 20, j * 20, 20, 20);
            } else {
                ctx.drawImage(spriteSheet, 20, 20, 20, 20, i * 20, j * 20, 20, 20);
            }
            i++;
        }
        i = 0;
        j++;
    }
};

var lvl1 = [
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,0,1,1,1,1,1,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,4,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,0,0,3,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,
    1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
    1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
];

// TileMap -> [[x,y]]
const initFreeFrom = t => {
    let x = 0, y = 0, cs = [];
    while (29 >= y) {
        while (39 >= x) {
            if (tget(t, x, y) === 0) {
                cs.push([x, y]);
            }
            x++;
        }
        x = 0;
        y++;
    }
    return cs;
};

const tFromPixelSpace = (x, y) => {
    return [
        Math.floor(x / 20), Math.floor(y / 20)
    ];
};
const tSolid = (t) => t === 1;

const clr = () => {
    ctx.fillStyle = clrColor;
    ctx.fillRect(0, 0, 800, 600);
};

// maths

const inCircle = (x, y, r, px, py) => {
    const dx = Math.abs(x - px);
    if (dx > r) return false;
    const dy = Math.abs(y - py);
    if (dy > r) return false;
    if (dx + dy <= r) return true;
    return dx*dx + dy*dy <= r*r;
};

const intersects = (x1, y1, w1, h1, x2, y2, w2, h2) =>
      (x1 < (x2 + w2) && (x1 + w1) > x2)
      && (y1 < (y2 + h2) && (y1 + h1) > y2);

// souls

const soulColors = ["rgba(255, 255, 255, 0.5)", "rgba(0, 255, 0, 0.5)", "rgba(0, 200, 200, 0.5)", "rgba(200, 0, 120, 0.5)"];

const despawnSoul = i => {
    console.log('despawnSoul: ', i);
    state.souls.s[i] = soul.INACTIVE;
    state.souls.x[i] = -30;
    state.souls.y[i] = -30;
};

const spawnRandomSoul = () => {
    let [sx, sy] = choose(state.lvlFree);
    for (let i=0; i<state.numSouls; i++) {
        if (state.souls.s[i] === soul.INACTIVE) {
            state.souls.x[i] = sx * 20;
            state.souls.y[i] = sy * 20;
            state.souls.s[i] = soul.ACTIVE;
            state.souls.c[i] = choose(soulColors);
            state.souls.ts[i] = (new Date()).getTime();
            return;
        }
    }
};

const renderSoul = i => {
    let sx = state.souls.x[i],
        sy = state.souls.y[i];
    bgCtx.save();
    bgCtx.fillStyle = state.souls.c[i];
    bgCtx.fillRect(0, 0, 20, 20);
    bgCtx.globalCompositeOperation = 'destination-atop';
    bgCtx.drawImage(spriteSheet, 40, 0, 20, 20, 0, 0, 20, 20);
    bgCtx.restore();
    ctx.drawImage(bg, 0, 0, 20, 20, sx, sy, 20, 20);
    bgCtx.clearRect(0, 0, bg.width, bg.height);
};

const initSouls = () => {
    let sx, sy;
    for (let i=0; i<state.numSouls; i++) {
        [sx, sy] = choose(state.lvlFree);
        state.souls.s.push(soul.ACTIVE);
        state.souls.x.push(sx * 20);
        state.souls.y.push(sy * 20);
        state.souls.c.push(choose(soulColors));
        state.souls.ts.push((new Date()).getTime());
        state.souls.tl.push(15 * 1000);
        state.souls.tc.push(30);
    }
};

const updateSoul = (i, dt) => {
    if (state.souls.s[i] === soul.ACTIVE) {
        let elapsedTime = (new Date()).getTime() - state.souls.ts[i];
        // update timer
        state.souls.tc[i] = Math.floor((state.souls.tl[i] - elapsedTime) / 1000);
        if (elapsedTime > state.souls.tl[i]) {
            if (state.heldSoul !== i) {
                spawnWraith(state.souls.x[i], state.souls.y[i]);
                despawnSoul(i);
            }
        }
    }
};

// gates

const initGatesFromMap = m => {
    let [i, j] = [0, 0],
        nGates = 0,
        x = [],
        y = [],
        c = [],
        t = null;
    while (j < 30) {
        while (i < 40) {
            t = tget(m, i, j);
            if (t > 1) {
                c.push(tiles[t]);
                x.push(i * 20);
                y.push(j * 20);
            }
            i++;
        }
        i = 0;
        j++;
    }
    return {x, y, c};
};

// main game updates

const init = () => {
    const startTime = (new Date()).getTime();
    Object.assign(state, {
        // player position x,y
        px: 20,
        py: 20,
        // soul check radius
        pr: 18,
        // player velocity x,y
        dx: 0,
        dy: 0,
        // player acceleration
        ax: 0, // current x acceleration
        ay: 0, // current y acceleration
        am: 3, // max acceleration
        pf: 0.98, // player friction
        ps: null, // current soul following player
        ph: 3, // player health
        scr: 0, // score
        // level stuff
        lvl: lvl1,
        lvlts: startTime, // level time start
        lvltl: 10 * 1000, // level time limit
        lvltc: 10, // level time count
        lvlFree: initFreeFrom(lvl1),
        // souls
        heldSoul: null,
        numSouls: 4, // determines the length of the souls arrays
        souls: {
            s: [],
            x: [],
            y: [],
            c: [],
            ts: [],
            tl: [], // wraith timer limit
            tc: []   // wraith time left
        },
        wraiths: {
            numWraiths: 0,
            x: [],
            y: [],
            s: []
        },
        numGates: 4, // determines the length of the gates arrays
        gates: initGatesFromMap(lvl1)
    });
    initSouls();
};

// wraiths

// TODO: fixed size
const spawnWraith = (x, y) => {
    console.log('Spawn Wraith');
    state.wraiths.x.push(x);
    state.wraiths.y.push(y);
    state.wraiths.s.push(wraith.WANDERING);
    state.wraiths.numWraiths++;
};

const despawnWraith = i => {
    state.wraiths.s[i] = wraith.INACTIVE;
};

const doWraithWandering = (i, dt) => {
    console.assert(state.wraiths.s[i] === wraith.WANDERING, 'Invalid wraith state');
    let [wx, wy] = [state.wraiths.x[i], state.wraiths.y[i]],
        [vx, vy] = [state.px - wx, state.py - wy],
        m = Math.sqrt(vx * vx + vy * vy);

    if (200 >= m) state.wraiths.s[i] = wraith.CHASING;
};

const doWraithChasing = (i, dt) => {
    console.assert(state.wraiths.s[i] === wraith.CHASING, 'Invalid wraith state');
    let [wx, wy] = [state.wraiths.x[i], state.wraiths.y[i]],
        [vx, vy] = [state.px - wx, state.py - wy],
        m = Math.sqrt(vx * vx + vy * vy),
        [ux, uy] = [vx / m, vy / m];
    state.wraiths.x[i] += ux * 3;
    state.wraiths.y[i] += uy * 3;

    if (intersects(state.px, state.py, 20, 20,
                   wx, wy, 20, 20)) {
        if (state.heldSoul !== null) {
            despawnSoul(state.heldSoul);
            state.heldSoul = null;
        } else {
            state.ph--;
        }
        despawnWraith(i);
    }
};

const updateWraith = (i, dt) => {
    console.assert(typeof state.wraiths.s[i] !== 'undefined', "BUG TRIGGERED");
    switch (state.wraiths.s[i]) {
    case wraith.WANDERING: doWraithWandering(i, dt); break;
    case wraith.CHASING: doWraithChasing(i, dt); break;
    case wraith.INACTIVE: return;
    }
};

const update = (dt) => {
    if (btn('Up')) state.dy = -1;
    if (btn('Down')) state.dy = 1;
    if (btn('Left')) state.dx = -1;
    if (btn('Right')) state.dx = 1;

    // update player acceleration
    state.ay = btn('Up') || btn('Down')
        ? state.am - state.ay / dt
        : state.ay * state.pf;
    state.ax = btn('Left') || btn('Right')
        ? state.am - state.ax / dt
        : state.ax * state.pf;

    let nextPy = state.py + state.dy * state.ay
    , nextPx = state.px + state.dx * state.ax;

    // handle tile collisions - x
    const {dx, dy, px, py} = state;
    for (let x=0; x<Math.abs(px - nextPx); x++) {
        for (let y=0; y<20; y++) {
            let [tx, ty] = tFromPixelSpace(dx > 0 ? px + 20 + x : px - x, py + y)
            , t = tget(state.lvl, tx, ty);
            if (tSolid(t)) {
                state.ax = 0;
                nextPx = px + ((dx > 0 ? x : x - 1) * dx);
                break;
            }
        }
    }
    // handle tile collisions - y
    for (let y=0; y<Math.abs(py - nextPy); y++) {
        for (let x=0; x<20; x++) {
            let [tx, ty] = tFromPixelSpace(px + x, dy > 0 ? py + 20 + y : py - y)
            , t = tget(state.lvl, tx, ty);
            if (tSolid(t)) {
                state.ay = 0;
                nextPy = py + ((dy > 0 ? y : y - 1) * dy);
                break;
            }
        }
    }

    // check for soul pickup
    if (state.heldSoul === null) {
        for (let i=0; i<state.numSouls; i++) {
            if (state.souls.s[i] === soul.ACTIVE) {
                if (inCircle(state.px+10,
                             state.py+10,
                             state.pr,
                             state.souls.x[i],
                             state.souls.y[i])) {
                    state.heldSoul = i;
                    state.souls.s[i] = soul.HELD;
                }
            }
        }
    }

    // update player state
    state.py = nextPy;
    state.px = nextPx;
    state.dy = Math.abs(state.dy) < 0.1 ? 0 : state.dy * state.pf;
    state.dx = Math.abs(state.dx) < 0.1 ? 0 : state.dx * state.pf;

    // update held soul state
    if (state.heldSoul !== null) {
        for (let i=0; i<state.numGates; i++) {
            const playerTouchingGate = intersects(
                state.px, state.py, 20, 20,
                state.gates.x[i], state.gates.y[i], 20, 20
            );
            const heldSoulMatchesGate =
                  state.souls.c[state.heldSoul] === state.gates.c[i];
            if (playerTouchingGate && heldSoulMatchesGate) {
                despawnSoul(state.heldSoul);
                state.heldSoul = null;
                state.scr += 1;
            }
        }
        state.souls.x[state.heldSoul] = state.px + 10;
        state.souls.y[state.heldSoul] = state.py + 10;
    }

    // update soul state
    for (let i=0; i<state.numSouls; i++) {
        updateSoul(i, dt);
    }

    // update wraith state
    for (let i=0; i<state.wraiths.numWraiths; i++) {
        updateWraith(i, dt);
    }

    // update level state
    let elapsedTime = (new Date()).getTime() - state.lvlts;
    state.lvltc = Math.floor((state.lvltl - elapsedTime) / 1000);

    if (0 >= state.lvltc) {
        spawnRandomSoul();
        state.lvlts = (new Date()).getTime();
        const scoreLevelUp = state.scr % 4 == 0,
              canSpeedUpLevelTimer = 3000 >= state.lvltl;
        if (scoreLevelUp && canSpeedUpLevelTimer) {
            state.lvltl -= 5 * 1000;
        }
    }

    if (-1 >= state.ph) {
        console.log('GAME OVER');
        init();
    }
};

const render = () => {
    tdraw(state.lvl);
    ctx.drawImage(spriteSheet, 0, 0, 20, 20, state.px, state.py, 20, 20);
    for (let i=0; i<state.numSouls; i++) {
        renderSoul(i);
    }
    for (let i=0; i<state.wraiths.numWraiths; i++) {
        if (state.wraiths.s[i] !== wraith.INACTIVE) {
            let wx = state.wraiths.x[i],
                wy = state.wraiths.y[i];
            ctx.drawImage(spriteSheet, 40, 20, 20, 20, wx, wy, 20, 20);
        }
    }
    for (let i=0; i<state.numGates; i++) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = state.gates.c[i];
        ctx.strokeRect(state.gates.x[i], state.gates.y[i], 20, 20);
    }
};

const loop = dt => {
    window.requestAnimationFrame(loop);
    currentTime = (new Date()).getTime();
    dt = currentTime - lastTime;
    update(dt);

    if (dt > interval) {
        clr();
        render();
        lastTime = currentTime - (dt % currentTime);
    }
};

(async () => {
    spriteSheet = await loadImage('test-sprite.png');
    init();
    window.requestAnimationFrame(loop);
})();

// input handling

const btns = {
    Up: 0,
    Down: 0,
    Left: 0,
    Right: 0,
    Start: 0,
    X: 0
};

const btn = name => btns.hasOwnProperty(name) && btns[name];

document.addEventListener('keydown', ev => {
    if (ev.key == 'w') {
        btns.Up = 1;
    } else if (ev.key == 's') {
        btns.Down = 1;
    } else if (ev.key == 'a') {
        btns.Left = 1;
    } else if (ev.key == 'd') {
        btns.Right = 1;
    } else if (ev.key == ' ') {
        btns.X = 1;
    } else if (ev.key == 'enter') {
        btns.Start = 1;
    }
});

document.addEventListener('keyup', ev => {
    if (ev.key == 'w') {
        btns.Up = 0;
    } else if (ev.key == 's') {
        btns.Down = 0;
    } else if (ev.key == 'a') {
        btns.Left = 0;
    } else if (ev.key == 'd') {
        btns.Right = 0;
    } else if (ev.key == ' ') {
        btns.X = 0;
    } else if (ev.key == 'enter') {
        btns.Start = 0;
    }
});

// helpers

function randRange (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function choose (arr) {
    return arr[randRange(0, arr.length)];
}

function loadImage(url) {
    return new Promise(r => { let i = new Image(); i.onload = (() => r(i)); i.src = url; });
}
