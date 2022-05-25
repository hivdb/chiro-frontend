import React from 'react';


export default function useSyncScroll(containerRef) {

  React.useEffect(
    () => {
      const updateScrollFunc = () => {
        const {current: container} = containerRef;
        if (!container) {
          setTimeout(updateScrollFunc, 50);
          return;
        }
        const images = Array.from(container.querySelectorAll('img'));
        let loadingImages = images.length;
        images.forEach(image => {
          if (image.complete) {
            loadingImages --;
            if (loadingImages === 0) {
              scrollToAnchor();
              setTimeout(scrollToAnchor, 500);
            }
          }
          else {
            const onImageLoad = () => {
              loadingImages --;
              if (loadingImages === 0) {
                scrollToAnchor();
                setTimeout(scrollToAnchor, 500);
              }
              image.removeEventListener('load', onImageLoad, false);
            };
            image.addEventListener('load', onImageLoad, false);
          }
        });

        function scrollToAnchor() {
          const {hash} = window.location;
          if (hash && hash.length > 1) {
            const anchor = hash.slice(1);
            const elem = document.getElementById(anchor);
            if (elem) {
              elem.scrollIntoView({block: 'center'});
            }
          }
        }
      };
      return updateScrollFunc;
    },
    [containerRef]
  );
}
