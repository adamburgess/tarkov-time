import { h, render, Component } from 'preact';
import './tailwind.css'
import { App } from './App';

console.log('Hello!');

render(<App />, document.getElementById('root')!);
