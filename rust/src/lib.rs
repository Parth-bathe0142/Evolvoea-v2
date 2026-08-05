use wasm_bindgen::prelude::wasm_bindgen;

mod pathfinder;

#[wasm_bindgen(start)]
fn main() {
	console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn test() -> String {
	"hello world".into()
}

#[wasm_bindgen]
unsafe extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    pub unsafe fn log(s: &str);
}
#[macro_export]
macro_rules! console_log {
    ($($t:tt)*) => (unsafe { crate::log(&format_args!($($t)*).to_string()) })
}