(()=>{
let changes=0;resize=()=>{changes++;restartMeasure()};
P.autoQuality=true;renderScale=1;P.cellSize=CELL_LADDER[0];cellStep=0;fxStep=0;fxDeferred=false;
measured=0;sampleSum=0;sampleN=0;adapting=true;adjusts=0;warmFrames=0;prevMeasured=0;undoStep=null;
for(let i=0;i<40000&&adapting;i++)autoQuality(P.cellSize===CELL_LADDER[0]?100:10);
return {changes,adapting,adjusts,cell:P.cellSize};
})()
