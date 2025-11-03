// High res timer func for running emu and emulated timers 
if (window.performance.now) {
    console.log("Using high performance timer");
    getTimestamp = function() { return window.performance.now(); };
} else {
    if (window.performance.webkitNow) {
        console.log("Using webkit high performance timer");
        getTimestamp = function() { return window.performance.webkitNow(); };
    } else {
        console.log("Using low performance timer");
        getTimestamp = function() { return new Date().getTime(); };
    }
}

function initCPU()
{
    // Start delayTimer countdown
    startAnimating(60, timerInterval);

    initFont();
}

// Method to set all values of an array
Array.prototype.setAll = function(v) {
    var i, n = this.length;
    for (i = 0; i < n; ++i) {
        this[i] = v;
    }
};

// Create a 2d array of specified size
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

// Generate random integer
function getRandomInt(min = 0, max = 255) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Convert hex string to binary string 
function hex2bin(hex){
    let bin = (parseInt(hex, 16).toString(2));
    if(bin.length > 8)
    {
        return bin.padStart(16, '0');
    }
    return bin.padStart(8, '0')
}

// Convert binary string to hex string
function bin2hex(bin)
{
    return (parseInt(bin, 2).toString(16).toUpperCase());
}



const memory = new Uint8Array(4096);
const stack = new Uint16Array(16);
const v = new Uint8Array(16);
const I = new Uint16Array(1);
// index 0 is delay timer, index 1 is sound timer
const timers = new Uint16Array(2);
const pc = new Uint16Array(1);
const sp = new Uint8Array(1);
const display = createArray(32, 64);

function initFont()
{
    // 0
    memory[0] = 0xF0;
    memory[1] = 0x90;
    memory[2] = 0x90;
    memory[3] = 0x90;
    memory[4] = 0xF0;
    // 1
    memory[0+5] = 0x20;
    memory[1+5] = 0x60;
    memory[2+5] = 0x20;
    memory[3+5] = 0x20;
    memory[4+5] = 0x70;
    // 2
    memory[0+10] = 0xF0;
    memory[1+10] = 0x10;
    memory[2+10] = 0xF0;
    memory[3+10] = 0x80;
    memory[4+10] = 0xF0;
    // 3
    memory[0+15] = 0xF0;
    memory[1+15] = 0x10;
    memory[2+15] = 0xF0;
    memory[3+15] = 0x10;
    memory[4+15] = 0xF0;
    // 4
    memory[0+20] = 0x90;
    memory[1+20] = 0x90;
    memory[2+20] = 0xF0;
    memory[3+20] = 0x10;
    memory[4+20] = 0x10;
    // 5
    memory[0+25] = 0xF0;
    memory[1+25] = 0x80;
    memory[2+25] = 0xF0;
    memory[3+25] = 0x10;
    memory[4+25] = 0xF0;
    // 6
    memory[0+30] = 0xF0;
    memory[1+30] = 0x80;
    memory[2+30] = 0xF0;
    memory[3+30] = 0x90;
    memory[4+30] = 0xF0;
    // 7
    memory[0+35] = 0xF0;
    memory[1+35] = 0x10;
    memory[2+35] = 0x20;
    memory[3+35] = 0x40;
    memory[4+35] = 0x40;
    // 8
    memory[0+40] = 0xF0;
    memory[1+40] = 0x90;
    memory[2+40] = 0xF0;
    memory[3+40] = 0x90;
    memory[4+40] = 0xF0;
    // 9
    memory[0+45] = 0xF0;
    memory[1+45] = 0x90;
    memory[2+45] = 0xF0;
    memory[3+45] = 0x10;
    memory[4+45] = 0xF0;
    // A
    memory[0+50] = 0xF0;
    memory[1+50] = 0x90;
    memory[2+50] = 0xF0;
    memory[3+50] = 0x90;
    memory[4+50] = 0x90;
    // B
    memory[0+55] = 0xE0;
    memory[1+55] = 0x90;
    memory[2+55] = 0xE0;
    memory[3+55] = 0x90;
    memory[4+55] = 0xE0;
    // C
    memory[0+60] = 0xF0;
    memory[1+60] = 0x80;
    memory[2+60] = 0x80;
    memory[3+60] = 0x80;
    memory[4+60] = 0xF0;
    // D
    memory[0+65] = 0xE0;
    memory[1+65] = 0x90;
    memory[2+65] = 0x90;
    memory[3+65] = 0x90;
    memory[4+65] = 0xE0;
    // E
    memory[0+70] = 0xF0;
    memory[1+70] = 0x80;
    memory[2+70] = 0xF0;
    memory[3+70] = 0x80;
    memory[4+70] = 0xF0;
    // F
    memory[0+75] = 0xF0;
    memory[1+75] = 0x80;
    memory[2+75] = 0xF0;
    memory[3+75] = 0x80;
    memory[4+75] = 0x80;
}



function parse_opcode(opcode)
{
    let opcodeStartsWith = Number(opcode.charAt(0));
    let opcodeEndsWith = Number(opcode.charAt(3));
    let opcodeBin = hex2bin(`${opcode}`);
    // nnn or addr - A 12-bit value, the lowest 12 bits of the instruction
    let nnn = Number(opcodeBin.slice(4));
    // n or nibble - A 4-bit value, the lowest 4 bits of the instruction
    let nibble = Number(`0x${bin2hex((opcodeBin.slice(4)).slice(8))}`);
    // x - A 4-bit value, the lower 4 bits of the high byte of the instruction
    let x = Number(`0x${bin2hex(opcodeBin.slice(4,8))}`);
    // y - A 4-bit value, the upper 4 bits of the low byte of the instruction
    let y = Number(`0x${bin2hex(opcodeBin.slice(8, 12))}`);
    // kk or byte - An 8-bit value, the lowest 8 bits of the instruction
    let kk = Number(`0x${bin2hex((opcodeBin.slice(4)).slice(4))}`);

    switch(opcodeStartsWith)
    {
        case 0x0:
            // CLS
            switch(nnn)
            {
                case 0x0E0:
                    clear_screen();
                    break;
                case 0x0EE:
                    return_from_subroutine();
                    break;
            }
            break;
        case 0x1:
            jump_to_addr(nnn);
            break;
        case 0x2:
            call_subroutine(nnn);
            break;
        case 0x3:
            // Skip next instruction if Vx = kk.
            skip_next_instruct_if_kk_eq(x, kk);
            break;
        case 0x4:
            // Skip next instruction if Vx != kk.
            skip_next_instruct_if_kk_not_eq(x, kk);
            break;
        case 0x5:
            // Skip next instruction if Vx = Vy.
            skip_next_instruct_if_x_y(x, y);
            break;
        case 0x6:
            // Set Vx = kk.
            set_x_to_kk(x, kk);
            break;
        case 0x7:
            // Set Vx = Vx + kk.
            set_x_to_x_plus_kk(x, kk);
            break;
        case 0x8:
            switch(opcodeEndsWith)
            {
                case 0x0:
                    // Stores the value of register Vy in register Vx.
                    set_x_to_y(x, y);
                    break;
                case 0x1:
                    // Set Vx = Vx OR Vy.
                    set_x_to_x_or_y(x, y);
                    break;
                case 0x2:
                    // Set Vx = Vx AND Vy.
                    set_x_to_x_and_y(x, y);
                    break;
                case 0x3:
                    // Set Vx = Vx XOR Vy.
                    set_x_to_x_xor_y(x, y);
                    break;
                case 0x4:
                    // Set Vx = Vx + Vy, set VF = carry.
                    set_x_to_x_plus_y(x, y);
                    break;
                case 0x5:
                    // Set Vx = Vx - Vy, set VF = NOT borrow.
                    set_x_to_x_minus_y(x, y);
                    break;
                case 0x6:
                    // Set Vx = Vx SHR 1.
                    shift_right_x(x);
                    break;
                case 0x7:
                    // Set Vx = Vy - Vx, set VF = NOT borrow.
                    set_x_to_y_minus_x(x, y);
                    break;
                case 0xE:
                    // Set Vx = Vx SHL 1.
                    shift_left_x(x);
                    break;
            }
            break;
        case 0x9:
             // Skip next instruction if Vx != Vy.
            skip_next_instruct_if_x_not_y(x, y);
            break;
        case 0xA:
            // Set I = nnn.
            set_i_to_nnn(nnn);
            break;
        case 0xB:
            // Jump to location nnn + V0.
            set_pc_to_nnn_plus_0(nnn);
            break;
        case 0xC:
            // Set Vx = random byte AND kk.
            set_x_to_kk_and_rand(x, kk);
            break;
        case 0xD:
            // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
            display_n_sprite_from_i_at_x_y(n, x, y);
            break;
        case 0xE:
            switch(opcodeEndsWith)
            {
                case 0x9E:
                    // Skip next instruction if key with the value of Vx is pressed.
                    skip_next_instruct_if_key_x_pressed(x);
                    break;
                case 0xA1:
                    // Skip next instruction if key with the value of Vx is not pressed.
                    skip_next_instruct_if_key_x_not_pressed(x);
                    break;
            }
            break;
        case 0xF:
            switch(kk)
            {
                case 0x07:
                    // Set Vx = delay timer value.
                    set_x_to_delay_timer(x);
                    break;
                case 0x0A:
                    // Wait for a key press, store the value of the key in Vx.
                    set_x_to_keypress(x);
                    break;
                case 0x15:
                    // Set delay timer = Vx.
                    set_delay_timer_to_x(x);
                    break;
                case 0x18:
                    // Set sound timer = Vx.
                    set_sound_timer_to_x(x);
                    break;
                case 0x1E:
                    // Set I = I + Vx.
                    set_i_to_i_plus_x(x);
                    break;
                case 0x29:
                    // Set I = location of sprite for digit Vx.
                    set_i_to_location_of_sprite_x(x);
                    break;
                case 0x33:
                    // Store BCD representation of Vx in memory locations I, I+1, and I+2.
                    set_pointer_at_i_to_bcd_x(x)
                    break;
                case 0x55:
                    // Store registers V0 through Vx in memory starting at location I.
                    set_pointer_at_i_to_v0_through_vx(x);
                    break;
                case 0x65:
                    // Read registers V0 through Vx from memory starting at location I.
                    set_v0_through_vx_to_pointer_at_i(x);
                    break;
            }
            break;
    }
    
}

// let temp = 0;
// // let a = getTimestamp();
// // setTimeout(()=>{let b = getTimestamp();console.log(b-a)}, 100);
// function step(timestamp) {
//     // do something for every frame
//     //   if(timestamp % 16.666 <= .09)
//     //   {

//     //   }
//     let fart = Math.round(timestamp * 100);
//     console.log(Math.round((fart - temp) % 16.666));
//     temp = fart;
//     window.requestAnimationFrame(step);
// }
// window.requestAnimationFrame(step);






// initialize the timer variables and start the animation
var fps, fpsInterval, startTime, now, then, elapsed;
var audio = new Audio('beep.wav');
audio.loop = true;
audio.load();

function startAnimating(fps, callback) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    callback();
}

// the animation loop calculates time elapsed since the last loop
// and only draws if your specified fps interval is achieved

function timerInterval() {

    // request another frame
    requestAnimationFrame(timerInterval);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        then = now - (elapsed % fpsInterval);

        // if timer is not 0, subtract 1
        // Delay timer
        if(timers[0] > 0)
        {
            timers[0]--;
        }
        // Sound timer
        if(timers[1] > 0)
        {
            audio.play();
            timers[1]--;
        }
        else
        {
            audio.pause()
        }
    }
}