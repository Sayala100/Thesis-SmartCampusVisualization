import logo from './logo.svg';
import './App.css';
import { useCallback } from 'react';
import { mount } from './edificios';

export default function Cube() {
    const containerRef = useCallback(mount, []);
    return <div className="Cube-container" ref={containerRef}></div>
}