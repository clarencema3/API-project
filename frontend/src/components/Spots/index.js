import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../store/spots';
import { useEffect } from 'react';
import SpotIndexItem from './SpotIndexItem';
import './SpotIndex.css';

export default function SpotsIndex() {
    const dispatch = useDispatch();
    const spotsObj = useSelector(state => state.spots);
    const spots = Object.values(spotsObj.allSpots)
    
    useEffect(() => {
        dispatch(fetchSpots())
    }, [dispatch])

    return (
        <div className='spots-container'>
            {spots.map(spot => {
                return (
                    <SpotIndexItem key={spot.id} spot={spot} />
                )
            })}
        </div>
    )
}