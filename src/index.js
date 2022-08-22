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

// souls

const soulColors = ['white', 'green', 'yellow'];

// main game updates

const init = () => Object.assign(state, {
    // player position x,y
    px: 20,
    py: 20,
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
    numSouls: 4, // determines the length of the souls arrays
    souls: {
        x: Array.from({length: 4}, () => randRange(2, 39)),
        y: Array.from({length: 4}, () => randRange(2, 29)),
        c: Array.from({length: 4}, () => choose(soulColors))
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
    const {dx, dy} = state;
    for (let y=0; y<20; y++) {
        let [tx, ty] = tFromPixelSpace(dx > 0 ? nextPx + 20 : nextPx, nextPy + y)
        , t = tget(state.lvl, tx, ty);
        if (tSolid(t)) {
            state.ax = 0;
            nextPx -= dx > 0
                ? (nextPx + 20) - (tx * 20)
                : nextPx - (20 + tx * 20);
            break;
        }
    }
    // handle tile collisions - y
    for (let x=0; x<20; x++) {
        let [tx, ty] = tFromPixelSpace(nextPx + x, dy > 0 ? nextPy + 20 : nextPy)
        , t = tget(state.lvl, tx, ty);
        if (tSolid(t)) {
            state.ay = 0;
            nextPy -= dy > 0
                ? (nextPy + 20) - (ty * 20)
                : nextPy - (20 + ty * 20);
            break;
        }
    }

    // check for soul pickup


    // update player state
    state.py = nextPy;
    state.px = nextPx;
    state.dy = Math.abs(state.dy) < 0.1 ? 0 : state.dy * state.pf;
    state.dx = Math.abs(state.dx) < 0.1 ? 0 : state.dx * state.pf;
};

const render = () => {
    tdraw(state.lvl);
    for (let i=0; i<state.numSouls; i++) {
        let sx = state.souls.x[i]
        , sy = state.souls.y[i];
        ctx.fillStyle = state.souls.c[i];
        const s = new Path2D();
        s.arc(sx * 20, sy * 20, 10, 0, 2 * Math.PI);
        ctx.fill(s);
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(state.px, state.py, 20, 20);
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
