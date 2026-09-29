/** Simplified lake view over Monroe Harbor, July 2, 2022. See public/brand/skyline-credit.txt. */
export function SkylineMark() {
  return <svg className="skyline-mark" viewBox="-45 -85 1810 535" aria-hidden="true" focusable="false">
    <desc>Chicago skyline over Monroe Harbor, simplified from Sea Cow’s July 2, 2022 photograph, cropped and exposure-adjusted by Nkon21. Skyline adaptation: CC BY-SA 4.0. Reference and license: /brand/skyline-credit.txt.</desc>
    <path className="skyline-curve" d="M-30 345 C-8 339 -10 -50 300 -60 C680 -90 1260 -40 1530 150 C1650 240 1600 343 1745 345" />
    <g fill="currentColor">
      <path data-landmark="311 South Wacker" d="M60 345 V202 H68 V164 L75 159 V154 H85 V160 H94 L98 174 V214 H107 V345 Z" />
      <path data-landmark="Willis Tower" d="M150 345 V177 H153 V124 H158 V82 L166 79 L176 83 V123 H194 V178 H201 V214 H209 V345 Z" />
      <path data-landmark="Willis antennas" d="M162 83 V49 H164 V83 Z M170 81 V40 H172 V81 Z" />
      <path data-landmark="333 South Wabash" d="M208 345 V203 L228 201 L274 210 V345 Z" />
      <path data-landmark="AT&T Corporate Center" d="M273 345 V201 L280 177 L296 179 L302 197 V229 H311 V345 Z" />
      <path data-landmark="Legacy at Millennium Park" d="M516 345 V177 L535 172 V183 H542 V291 H552 V345 Z" />
      <path data-landmark="Heritage at Millennium Park" d="M666 345 V219 H674 V211 H691 V222 H703 V345 Z" />
      <path data-landmark="Crain Communications Building" d="M728 345 V246 L745 226 L762 246 V345 Z" />
      <path data-landmark="One Prudential Plaza" d="M765 345 V232 H773 V226 H809 V222 H822 V345 Z M809 225 V177 H811 V225 Z" />
      <path data-landmark="Two Prudential Plaza" d="M829 345 V197 L837 181 L845 167 L849 153 L853 168 L861 181 V345 Z M848 159 V145 H850 V159 Z" />
      <path data-landmark="Aon Center" d="M859 345 V119 L883 113 L905 119 V345 Z" />
      <path data-landmark="Blue Cross Blue Shield Tower" d="M894 345 V183 L925 179 L949 184 V345 Z" />
      <path data-landmark="340 on the Park" d="M948 345 V199 L970 195 L985 199 V345 Z" />
      <path data-landmark="Aqua" d="M980 345 V181 L1007 175 L1007 345 Z" />
      <path data-landmark="St. Regis Chicago" d="M1113 345 V264 H1110 V227 H1114 V171 H1119 V103 L1133 100 L1142 103 V171 H1154 V244 H1163 V345 Z" />
      <path data-landmark="875 North Michigan Avenue" d="M1239 283 L1247 174 L1269 175 L1275 283 Z M1250 175 V148 H1252 V175 Z M1262 175 V136 H1264 V175 Z" />
      <path data-landmark="One Bennett Park" d="M1351 345 L1358 201 L1371 197 L1386 201 L1380 345 Z" />
      <path data-landmark="Lake Point Tower" d="M1525 345 L1532 221 Q1540 217 1545 220 L1552 211 L1568 212 L1576 217 L1583 216 L1580 345 Z" />
      <path d="M0 328 H1600 V345 H0 Z" />
      {/* Observed lower rooflines and foreground occlusions, consolidated at logo scale. */}
      <path d="M0 345 V226 H21 V199 H36 V230 H49 V288 H66 V272 H88 V301 H104 V319 H132 V278 H143 V259 L151 252 L158 263 V310 H177 V294 H196 V319 H220 V288 H244 V277 H264 V293 H289 V243 H307 V228 H319 V263 H337 V250 H355 V226 H378 V232 H390 V252 H417 V208 H426 V182 L445 178 L464 183 V214 H490 V234 H508 V288 H526 V277 H545 V250 H558 V204 H574 V216 H586 V258 H600 V210 H607 L616 233 V292 H627 V261 H640 V248 L649 236 L658 250 V293 H670 V270 H684 V249 H693 V235 H708 V245 H723 V314 H749 V319 H782 V288 H800 V307 H826 V299 H848 V336 H870 V331 H892 V340 H1049 V251 H1060 V240 H1071 V252 H1095 V272 H1149 V230 H1174 V223 H1200 V230 H1209 V218 H1229 V224 H1239 V207 H1273 V222 H1291 V234 H1310 V287 H1330 V254 H1347 V322 H1372 V246 H1390 V227 H1403 V230 H1421 V242 H1431 V255 H1457 V332 H1480 V338 H1518 V345 Z" />
    </g>
    <g className="skyline-detail" fill="none" strokeWidth="3">
      <path d="M165 86 V338 M180 128 V338 M864 123 V337 M884 120 V337 M900 124 V337" />
      <path d="M1248 179 L1267 198 L1246 218 M1268 179 L1248 199 L1270 218" />
    </g>
    <g className="skyline-stars" fill="currentColor">
      {[605, 735, 865, 995].map(x => <polygon className="chicago-star" key={x} transform={`translate(${x} 393) scale(3.8)`} points="0,-8 2.5,-4.33 6.93,-4 5,0 6.93,4 2.5,4.33 0,8 -2.5,4.33 -6.93,4 -5,0 -6.93,-4 -2.5,-4.33" />)}
    </g>
    <path className="skyline-curve" d="M498 355 H1102 M498 429 H1102" />
  </svg>;
}
