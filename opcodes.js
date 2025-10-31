// Chip8 Instructions

function clear_screen()
{
    display.setAll(0);
}

function return_from_subroutine()
{
    pc = stack[sp];
    sp--;
}

function jump_to_addr(nnn)
{
    pc = nnn;
}

function call_subroutine(nnn)
{
    sp++;
    stack[sp] = pc;
    pc = nnn;
}

function skip_next_instruct_if_kk_eq(x, kk)
{
    if(v[x] == kk)
    {
        pc += 2;
    }
}

function skip_next_instruct_if_kk_not_eq(x, kk)
{
    if(v[x] != kk)
    {
        pc += 2;
    }
}

function skip_next_instruct_if_x_y(x, y)
{
    if(v[x] == v[y])
    {
        pc += 2;
    }
}

function set_x_to_kk(x, kk)
{
    v[x] = kk;
}

function set_x_to_x_plus_kk(x, kk)
{
    v[x] += kk;
}

function set_x_to_y(x, y)
{
    v[x] = v[y];
}
        
function set_x_to_x_or_y(x, y)
{
    v[x] = v[x] | v[y]
}
        
function set_x_to_x_and_y(x, y)
{
     v[x] = v[x] & v[y]
}
        
function set_x_to_x_xor_y(x, y)
{
     v[x] = v[x] ^ v[y]
}
        
function set_x_to_x_plus_y(x, y)
{
    let temp = v[x] + v[y];
    v[x] = temp;
    if(temp > 255)
    {
        v[0xf] = 1;
    }
    else
    {
        v[0xf] = 0;
    }
}
        
function set_x_to_x_minus_y(x, y)
{
    if(v[x] > v[y])
    {
        v[0xf] = 1;
    }
    else
    {
        v[0xf] = 0;
    }
    v[x] -= v[y];
}
        
function shift_right_x(x)
{
    if(v[x] & 1 == 1)
    {
        v[0xf] = 1;
    }
    else
    {
        v[0xf] = 0;
    }

    v[x] = v[x]>>>1;
}
        
function set_x_to_y_minus_x(x, y)
{
    if(v[y] > v[x])
    {
        v[0xf] = 1;
    }
    else
    {
        v[0xf] = 0;
    }
    v[x] = v[y] - v[x];
}
        
function shift_left_x(x)
{
    if(v[x] & 128 == 128)
    {
        v[0xf] = 1;
    }
    else
    {
        v[0xf] = 0;
    }

    v[x] = v[x]<<1;
}
        
function skip_next_instruct_if_x_not_y(x, y)
{
    if(v[x] != v[y])
    {
        pc += 2;
    }
}

function set_i_to_nnn(nnn)
{
    i = nnn;
}

function set_pc_to_nnn_plus_0(nnn)
{
    pc = v[0x0] + nnn;
}

function set_x_to_kk_and_rand(x, kk)
{
    v[x] = kk & getRandomInt();
}

function display_n_sprite_from_i_at_x_y(n, x, y)
{
    for(let j = 0;j<n;J++)
    {

    }
}

function skip_next_instruct_if_key_x_pressed(x)
{}
        
function skip_next_instruct_if_key_x_not_pressed(x)
{}
        
function set_x_to_delay_timer(x)
{
    v[x] = timers[0];
}
        
function set_x_to_keypress(x)
{}
        
function set_delay_timer_to_x(x)
{
    timers[0] = v[x];
}
        
function set_sound_timer_to_x(x)
{
    timers[1] = v[x];
}
        
function set_i_to_i_plus_x(x)
{
    I += v[x];
}
        
function set_i_to_location_of_sprite_x(x)
{}
        
function set_pointer_at_i_to_bcd_x(x)
{
    if(v[x] < 10)
    {
        let temp = `00${v[x]}`;
    }
    else if(v[x] < 100)
    {
        let temp = `0${v[x]}`;
    }
    else
    {
        let temp = `${v[x]}`;
    }
    memory[I] = temp.slice(0,1);
    memory[I + 1] = temp.slice(1,2);
    memory[I + 2] = temp.slice(2,3);
}
        
function set_pointer_at_i_to_v0_through_vx(x)
{
    for(let j = 0;j<x;j++)
    {
        memory[I+j] = v[j];
    }
}

function set_v0_through_vx_to_pointer_at_i(x)
{
    for(let j = 0;j<x;j++)
    {
        v[j] = memory[I+j];
    }
}


// End Chip8 Instructions