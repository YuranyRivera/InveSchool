import React from 'react';
import '@dotlottie/player-component';

const Example = () => {
  return (
    <dotlottie-player
      src="https://lottie.host/0aca447b-d3c9-46ed-beeb-d4481815915a/qvvqgKAKQU.lottie"
      background="transparent"
      speed="1"
      style={{ width: '300px', height: '300px' }}
      loop
      autoplay
    />
  );
};

export default Example;