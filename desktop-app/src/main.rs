#![windows_subsystem = "windows"]

use std::time::{Duration, SystemTime};

use druid::piet::Text;
use druid::widget::{Controller, ControllerHost, EnvScope, Flex, Label};
use druid::{
    AppLauncher, Data, Env, Event, EventCtx, FontDescriptor, Key, Lens,
    PlatformError, TimerToken, Widget, WidgetExt, WindowDesc, Color, Insets,
};

const BLENDER_FONT: Key<FontDescriptor> = Key::new("it.is.blender");

fn main() -> Result<(), PlatformError> {
    let main_window = WindowDesc::new(ui_builder())
        .window_size_policy(druid::WindowSizePolicy::Content)
        .resizable(false)
        .title("Tarkov Time");
    AppLauncher::with_window(main_window)
        .launch(MyState {
            blender: None,
            time: get_unix_time(),
        })
}

struct OnStart {
    timer_id: TimerToken,
}

#[derive(Clone, Data, Lens)]
struct MyState {
    blender: Option<FontDescriptor>,
    time: u64,
}

static TIMER_INTERVAL: Duration = Duration::from_millis(1000 / 7);

const TARKOV_RATIO: u64 = 7;

fn get_unix_time() -> u64 {
    SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap().as_millis() as u64
}

const fn hrs(num: u64) -> u64 {
    1000 * 60 * 60 * num
}

fn real_time_to_tarkov_time(time: u64, left: bool) -> u64 {
    let one_day = hrs(24);
    let russia = hrs(3);

    let offset = russia + if left { 0 } else { hrs(12) };

    (offset + (time * TARKOV_RATIO)) % one_day
}

fn format_hms(time: u64) -> String {
    let total = time / 1000;
    let hours = total / (60 * 60);
    let mins = (total / 60) % 60;
    let secs = total % 60;
    format!("{hours:02}:{mins:02}:{secs:02}")
}


impl<W: Widget<MyState>> Controller<MyState, W> for OnStart {
    fn event(
        &mut self,
        child: &mut W,
        ctx: &mut EventCtx,
        event: &Event,
        data: &mut MyState,
        env: &Env,
    ) {
        match event {
            Event::WindowConnected => {
                let fam = ctx.text().load_font(include_bytes!("blender.otf")).unwrap();
                let descriptor = FontDescriptor::new(fam);
                data.blender = Some(descriptor);

                self.timer_id = ctx.request_timer(TIMER_INTERVAL);
                
            }
            Event::Timer(id) => {
                if *id == self.timer_id {
                    ctx.request_layout();
                    self.timer_id = ctx.request_timer(TIMER_INTERVAL);
                    data.time = get_unix_time();
                }
            }
            _ => (),
        }
        child.event(ctx, event, data, env)
    }
}

fn build_box_widget(left: bool) -> impl Widget<MyState> {
    let inner_padding = 15.0_f64;
    let outer_padding = 10.0_f64;

    let label = Label::new(move |data: &u64, _env: &_| {
        format_hms(real_time_to_tarkov_time(*data, left))
    })
        .with_font(BLENDER_FONT)
        .with_text_size(30_f64)
        .padding(inner_padding)
        .border(Color::GRAY, 2.0)
        .padding(if left { Insets::new(outer_padding, outer_padding, outer_padding/2.0, outer_padding) } else { Insets::new(outer_padding/2.0, outer_padding, outer_padding, outer_padding) })
        .lens(MyState::time);

    label
}

fn ui_builder() -> impl Widget<MyState> {

    let label1 = build_box_widget(true);
    let label2 = build_box_widget(false);
    
    ControllerHost::new(
        EnvScope::new(
            |env, data| {
                env.set(BLENDER_FONT, data.blender.clone().unwrap_or_default());
            },
            Flex::row().with_child(label1).with_child(label2),
        ),
        OnStart {
            timer_id: TimerToken::INVALID,
        },
    )
}
