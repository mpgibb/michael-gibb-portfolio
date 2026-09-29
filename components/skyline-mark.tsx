/** Static Chicago mark; kept separate from the approved browser icons. */
export function SkylineMark() {
  return <svg className="skyline-mark" viewBox="0 0 240 130" aria-hidden="true" focusable="false">
    <path className="skyline-curve" d="M3 99 C48 97 70 5 119 5 C168 5 192 97 237 99" />
    <path fill="currentColor" d="M3 99 L31 98 V94 H36 V92 H40 V86 H46 V89 H54 V96 H56 V81 H59 V77 H64 V81 H67 V95 H70 V86 H73 V62 H75 V52 H77 V42 H78 V52 H80 V42 H81 V52 H83 V62 H85 V96 H88 V78 H92 V96 H94 V52 H96 V36 H98 V23 H100 V10 H101 V23 H103 V10 H104 V23 H106 V36 H109 V52 H111 V91 H113 V80 H117 V96 H119 V60 H122 V53 H126 V60 H129 V96 H132 V69 L137 63 L142 69 V96 H145 L149 37 H151 V27 H152 V37 H156 V25 H157 V37 H159 L163 91 H166 V55 H175 V96 H178 V87 H183 V83 H189 V87 H192 V97 H196 V93 H202 V97 L237 99 Z" />
    <g className="skyline-detail" fill="none" strokeWidth=".7">
      <path d="M137 64 V74 M133 70 L137 74 L141 70 M168 57 V96 M171 57 V96 M174 57 V96" />
      <path opacity=".5" d="M150 43 L158 53 L148 66 L160 78 L146 93 M157 43 L149 53 L159 66 L147 78 L162 93" />
    </g>
    <g className="skyline-stars" fill="currentColor">
      {[72, 104, 136, 168].map(x => <polygon className="chicago-star" key={x} transform={`translate(${x} 114)`} points="0,-8 2.5,-4.33 6.93,-4 5,0 6.93,4 2.5,4.33 0,8 -2.5,4.33 -6.93,4 -5,0 -6.93,-4 -2.5,-4.33" />)}
    </g>
    <path className="skyline-curve" strokeWidth="1" d="M47 103 H193 M47 126 H193" />
  </svg>;
}
