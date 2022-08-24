const stage = document.getElementById('stage');
const ctx = stage.getContext('2d');

let currentTime = 0
, lastTime = (new Date()).getTime()
, dt = 0
, fps = 60
, interval = fps / 1000
, clrColor = 'black'
, state = {};

// tilemaps -- 40x30 at 20x20px
const tiles =
      [ 'grey' // floor
      , 'blue' // wall
      ];

const tset = (m, x, y, v) => m[y * 40 + x] = v;
const tget = (m, x, y) => m[y * 40 + x];
const tdraw = m => {
    let [i, j] = [0, 0];
    while (j < 30) {
        while (i < 40) {
            let t = tget(m, i, j);
            ctx.fillStyle = tiles[t];
            ctx.fillRect(i * 20, j * 20, 20, 20);
            i++;
        }
        i = 0;
        j++;
    }
};
const tFromPixelSpace = (x, y) => {
    return [
        Math.floor(x / 20), Math.floor(y / 20)
    ];
};
const tSolid = (t) => t != 0;

const lvl1 = Array.from({length: 40 * 30}, () => 0);
tset(lvl1, 4, 4, 1);
tset(lvl1, 5, 4, 1);
tset(lvl1, 6, 4, 1);
tset(lvl1, 6, 5, 1);
tset(lvl1, 6, 6, 1);

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

const soulColors = ['white', 'green', 'yellow', 'pink'];

// main game updates

const init = () => Object.assign(state, {
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
    lvl: lvl1,
    // souls
    heldSoul: null,
    numSouls: 4, // determines the length of the souls arrays
    souls: {
        x: Array.from({length: 4}, () => randRange(2, 39) * 20),
        y: Array.from({length: 4}, () => randRange(2, 29) * 20),
        c: Array.from({length: 4}, () => choose(soulColors))
    },
    numGates: 4, // determines the length of the gates arrays
    gates: {
        x: [30, 490, 490, 760],
        y: [290, 30, 560, 290],
        c: ['white', 'green', 'yellow', 'pink']
    }
});

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
                nextPx = px + ((x - 1) * dx);
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
                nextPy = py + ((y - 1) * dy);
                break;
            }
        }
    }

    // check for soul pickup
    if (state.heldSoul === null) {
        for (let i=0; i<state.numSouls; i++) {
            if (inCircle(state.px+10,
                         state.py+10,
                         state.pr,
                         state.souls.x[i],
                         state.souls.y[i])) {
                state.heldSoul = i;
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
                state.souls.x[state.heldSoul] = -30;
                state.souls.y[state.heldSoul] = -30;
                state.heldSoul = null;
            }
        }
        state.souls.x[state.heldSoul] = state.px + 10;
        state.souls.y[state.heldSoul] = state.py + 10;
    }
};

const render = () => {
    tdraw(state.lvl);
    ctx.fillStyle = 'red';
    ctx.fillRect(state.px, state.py, 20, 20);
    for (let i=0; i<state.numSouls; i++) {
        let sx = state.souls.x[i]
        , sy = state.souls.y[i];
        ctx.fillStyle = state.souls.c[i];
        const s = new Path2D();
        s.arc(sx, sy, 10, 0, 2 * Math.PI);
        ctx.fill(s);
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

init();
window.requestAnimationFrame(loop);

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
};

function choose (arr) {
    return arr[randRange(0, arr.length)];
}
