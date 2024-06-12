import React from 'react';
import UploadPage from './UploadPage';

function App() {
  return (
    <div className="App">
        <UploadPage />
    </div>
  );
}

export default App;

// useEffect(() => {
//     fetch('http://localhost:7000/api')
//         .then(response => response.json())
//         .then(data => setData(data))
//         .catch(error => console.error('Error: ', error));
// }, []);
