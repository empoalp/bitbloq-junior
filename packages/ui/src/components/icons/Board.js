import React from "react";

const SvgBoard = props => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10.21 6.541a.694.694 0 111.39 0 .694.694 0 01-1.391 0zM15.61 11a.695.695 0 111.388.002A.695.695 0 0115.61 11zm0 5.692a.695.695 0 111.388.002.695.695 0 01-1.387-.002zm5.317 4.236h-8.028v-.876l1.893-1.185c.43.3.95.48 1.513.48a2.657 2.657 0 002.654-2.655 2.657 2.657 0 00-2.654-2.654 2.658 2.658 0 00-2.598 3.196l-2.769 1.733v1.961h-1.22v-4.576l5.073-3.177c.43.301.951.48 1.514.48A2.657 2.657 0 0018.959 11a2.657 2.657 0 00-2.654-2.654 2.658 2.658 0 00-2.598 3.196l-5.949 3.725v5.661H6.652V10.43L9.39 8.716c.43.301.952.48 1.514.48a2.657 2.657 0 002.655-2.655 2.657 2.657 0 00-2.655-2.654 2.658 2.658 0 00-2.597 3.196L4.694 9.345v11.582h-1.62V3.073H17.9v3.244l3.027 2.764v11.846zM19.86 5.453V2.098a.986.986 0 00-.985-.985H2.099a.986.986 0 00-.987.985v19.803c0 .545.442.986.986.986h19.803c.544 0 .986-.44.986-.986V8.696c0-.306-.128-.598-.355-.804L19.86 5.453z"
    />
  </svg>
);

export default SvgBoard;
