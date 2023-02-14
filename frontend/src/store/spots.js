import { csrfFetch } from "./csrf";

const GET_SPOTS = 'spots/all';
const GET_SINGLE_SPOT = 'spot/spotId';
const ADD_SPOT = 'spots/add';


export const getSpots = (spots) => {
    return {
        type: GET_SPOTS,
        spots
    }
}

export const getSingleSpot = (spot) => {
    return {
        type: GET_SINGLE_SPOT,
        spot
    }
}

export const addSpot = (spot) => {
    return {
        type: ADD_SPOT,
        spot
    }
}


export const createSpot = (spot, images) => async(dispatch) => {
    const { address, city, state, country, lat, lng, name, description, price } = spot;
    //get the response from fetching the spot first
    const response = await csrfFetch('/api/spots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price
        })
    });
    //if we are able to find the spot
    if (response.ok) {
        //we want to turn into into a json object
        const spot = await response.json();
        //now we loop through the images array that we passed in through the dispatch
        //for every image object in that array, we want to fetch that image
        spot['SpotImages'] = [];
        for (let i = 0; i < images.length; i++) {
            let nextResponse = await csrfFetch(`/api/spots/${spot.id}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(images[i])
            })
            //if the response is ok from the fetch
            if (nextResponse.ok) {
                //we want to attach that image object to the property called SpotImages(array)
                let singleImage = await nextResponse.json();
                spot.SpotImages.push(singleImage)
            }
        }
        //once we are done with the loop, we can dispatch the spot
        dispatch(addSpot(spot))
        dispatch(getSingleSpot(spot.id))
        return spot
    }
}

export const fetchSingleSpot = (spotId) => async (dispatch) => {
    const response = await csrfFetch(`/api/spots/${spotId}`);
    if (response.ok) {
        const data = await response.json();
        dispatch(getSingleSpot(data))
        return data
    }
}

export const fetchSpots = () => async (dispatch) => {
    const response = await csrfFetch('/api/spots');
    if (response.ok) {
        const data = await response.json();
        const normalizedData = {};
        data.Spots.forEach(item => normalizedData[item.id] = item)
        dispatch(getSpots(normalizedData));
    }
}

const initialState = { allSpots: {}, singleSpot: {} };

const spotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_SPOT:
            const newState = {...state, allSpots: {...state.allSpots, ...action.spot}, singleSpot: {...state.spot, ...action.spot} }
            newState.allSpots['previewImage'] = newState.allSpots.SpotImages[0].url;
            delete newState.allSpots.SpotImages
            return newState
        case GET_SINGLE_SPOT:
            return {...state, allSpots: {...state.allSpots} ,singleSpot: {...state.spot, ...action.spot}}
        case GET_SPOTS:
            return {...state, allSpots: {...state.allSpots, ...action.spots} }
        default:
            return state;
    }
}

export default spotsReducer;