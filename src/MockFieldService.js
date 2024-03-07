export function getField(id) {
    return {
        "label": "Sales region",
        "required": false,
        "choices": [
            "Asia",
            "Australia",
            "Western Europe",
            "North America",
            "Eastern Europe",
            "Latin America",
            "Middle East and Africa"
        ],
        "displayAlpha": true,
        "default": "North America"
    }
}

export function saveField(fieldJson) {
    // 1. Construct the JSON data (no change needed here)
    const postData = fieldJson; 

    // 2. Use 'fetch' for the POST request
    fetch('https://run.mocky.io/v3/950dc5bf-71bf-4134-bb6c-541e9fc68e8d', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Data successfully posted to back-end!');
    })
    .catch(error => {
        console.error('Error posting data:', error);
    });

    // 3. Log for debugging
    console.log('POST data:', postData); 
}
