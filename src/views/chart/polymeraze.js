import React from 'react';
import {useQuery} from '@apollo/react-hooks';
import searchQuery from './query.gql';

import {Header, Loader} from 'semantic-ui-react';

import { Group } from '@vx/group';
import { Bar } from '@vx/shape';
import { scaleBand, scaleLog, scaleOrdinal } from '@vx/scale';
import { AxisLeft } from '@vx/axis';
import {LegendItem, LegendLabel, LegendOrdinal} from '@vx/legend';


const colorScheme = {
  'Remdesivir': {
    'ordinal': 1,
    'display': 'Remdesivir',
    'color': '#4e79a7',
  },
  'NHC': {
    'ordinal': 2,
    'display': 'Beta-D-N4-Hydroxycytidine (NHC)',
    'color': '#59a14f',
  },
  'Ribavirin': {
    'ordinal': 3,
    'display': 'Ribavirin',
    'color': '#f2812b',
  },
  'Favipiravir': {
    'ordinal': 4,
    'display': 'Favipiravir',
    'color': '#e15759',
  },
  'Galidesivir': {
    'ordinal': 5,
    'display': 'Galidesivir',
    'color': '#b07aa1',
  },
  'Other': {
    'ordinal': 6,
    'display': 'Other',
    'color': '#bab0ac',
  },
};


function prepareChartData(data) {
  const {virusExperiments} = {...data};
  let chartData = virusExperiments.edges.filter(
    node => ['SARS-CoV', 'SARS-CoV-2'].includes(node.node.virusName)
    );
  chartData = chartData.filter(node => node.node.ec50);

  chartData = chartData.map((node, idx) => {
    const compoundName = node.node.compoundNames[0];
    let color = colorScheme.Other.color
    if (compoundName in colorScheme) {
      color = colorScheme[compoundName].color;
    }
    return {
      idx: idx+1,
      compoundName: compoundName,
      ec50: node.node.ec50,
      color: color,
    }
  });

  chartData = chartData.sort((a, b) => a['ec50'] - b['ec50']);
  return chartData;
};


function InnerChart(props) {
  const {data} = {...props};
  const barWidth = 17;
  const width = barWidth * data.length + 100;
  const height = 550;
  const margin = {
    top: 20,
    bottom: 20,
    left: 80,
    right: 20};

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const x = d => d.idx;
  const y = d => d['ec50'];

  const xScale = scaleBand({
    rangeRound: [0, xMax],
    domain: data.map(x),
    padding: 0,
  });

  const logScaleMin = 0.01;
  const logScaleMax = 10000;
  const yScale = scaleLog({
    rangeRound: [yMax, 0],
    domain: [logScaleMin, logScaleMax],
  });

  const compose = (scale, accessor) => data => scale(accessor(data));
  const xPoint = compose(xScale, x);
  const yPoint = compose(yScale, y);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <AxisLeft
          scale={yScale}
          label={"EC50"}
          labelProps={{fontSize: 16}}
          stroke={'#1b1a1e'}
          tickTextFill={'#777777'}
          tickFormat={e=>e}
          tickValues={[0.01,0.1,1,10, 100, 1000, 10000]}
        />
      </Group>
      <Group
       left={margin.left}
       top={margin.top}
       >
        {data.map((d, i) => {
          const barHeight = yMax - yPoint(d);
          return (
            <Bar key={`bar-${i}`}
              x={xPoint(d)}
              y={yPoint(d)}
              height={barHeight}
              width={xScale.bandwidth()}
              fill={d.color}
            />
          );
        })}
      </Group>
    </svg>
  );
}

function InnerLegend() {
  const orderedColorScheme = Object.values(
    colorScheme).sort((a, b) => a.ordinal - b.ordinal);
  const scaleCompound = scaleOrdinal({
    domain: orderedColorScheme.map(i => i.display),
    range: orderedColorScheme.map(i => i.color)
  });
  return (
    <div>
      <LegendOrdinal scale={scaleCompound}>
        {labels => {
          return (
            <div style={
              {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center'
              }
              }>
              {
              labels.map((label, i) => {
                const size = 15;
                return (
                  <LegendItem
                    key={`legend-ordinal-${i}`}
                    margin={'5px 5px'}
                  >
                    <svg width={size} height={size}>
                      <rect fill={label.value} width={size} height={size} />
                    </svg>
                    <LegendLabel margin={'5px'}>
                      {label.text}
                    </LegendLabel>
                  </LegendItem>
                );
              })}
            </div>
          );
        }}
      </LegendOrdinal>
    </div>
  )
}


export default function PolymerazeChart() {
  const compoundTargetName = 'Polymerase';
  let {loading, error, data} = useQuery(searchQuery, {
    variables: {
      compoundTargetName,
    }
  });

  if (loading) {
    return <Loader active inline="centered" />
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  const chartData = prepareChartData(data);

  return (<>
    <Header>Polymerase</Header>
    <InnerChart data={chartData}/>
    <InnerLegend />
  </>)

};
