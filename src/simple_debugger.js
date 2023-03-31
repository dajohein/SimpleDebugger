import './simple_debugger.css';
import SimpleDebugger from './SimpleDebugger';
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas)

const simpleDebugger = new SimpleDebugger();

dom.i2svg();