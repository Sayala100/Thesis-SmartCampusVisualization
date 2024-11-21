import { useCallback } from 'react';
import { mount } from './edificios';
import './index.css';

export default function Edificio() {
	const containerRef = useCallback(mount, []);
	return <div className="Modelo-container" ref={containerRef}></div>
}