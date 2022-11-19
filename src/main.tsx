import { h, render } from 'preact';
import './tailwind.css'
import { App } from './App';

render(<App />, (document.all as unknown as { root: Element }).root!);
