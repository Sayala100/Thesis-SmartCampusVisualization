import React, { useCallback, useState, useEffect } from 'react';
import { mount } from './edificios';
import './index.css';
const API_URL = window.location.hostname === 'smartcampus.notadev.lat' ? 'https://tesis.notadev.lat' : 'http://localhost:2604';


export default function Edificio() {
    const [selectedRango, setSelectedRango] = useState(null);
    const [rangos, setRangos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasInteracted, setHasInteracted] = useState(false);

    const containerRef = useCallback(mount, []);

    useEffect(() => {
        async function fetchRangos() {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/procesar_entradas_edificio`);
                const data = await response.json();
                const availableRangos = Object.keys(data[Object.keys(data)[0]]);
                setRangos(availableRangos);
            } catch (error) {
                console.error('Error fetching rangos:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRangos();
    }, []);

    const handleSliderChange = (e) => {
        if (!hasInteracted) {
            setHasInteracted(true);
        }
        setSelectedRango(rangos[e.target.value]);
    };

    useEffect(() => {
        if (hasInteracted && selectedRango && window.manualRangoUpdate) {
            window.manualRangoUpdate(selectedRango);
        }
    }, [selectedRango, hasInteracted]);

    return (
        <div className="edificio-container">
            <div className="rango-slider">
                <div className="slider-inner">
                    <input
                        type="range"
                        min="0"
                        max={rangos.length - 1}
                        value={rangos.indexOf(selectedRango) === -1 ? 0 : rangos.indexOf(selectedRango)}
                        onChange={handleSliderChange}
                        disabled={isLoading}
                    />
                    <div className="slider-labels">
                        {<span className="rango-text">Seleccionar franja horaria</span>}
                    </div>
                </div>
            </div>
            <div className="Modelo-container" ref={containerRef}></div>
        </div>
    );
}
