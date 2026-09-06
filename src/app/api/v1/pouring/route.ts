// NFR 4 (IoT-preparedness): standard REST shape ready for a Load
// Cell / PLC / RFID reader to call directly later. Re-exports the same
// handler used by the operator UI — one implementation, two paths.
//
// ponytail: still session-cookie authenticated for now, same as the UI
// route. A real field device needs a service/API-key auth mode instead of
// a browser session — add that when actual hardware is being wired up,
// no point building it speculatively today.
export { POST } from "@/app/api/pouring/route";
