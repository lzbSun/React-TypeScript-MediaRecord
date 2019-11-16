import React, { FunctionComponent, useEffect } from 'react'
import Highcharts from 'highcharts'


type Charts = { data:number[] }


const Charts:FunctionComponent<Charts> = ({ data }) => {
    useEffect(() => {

        Highcharts.chart({
            chart: {
                renderTo: 'highChartContainer',
                type:'line'
            },
            title : {
                text: '语速'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointInterval: 10,
                    pointStart: 0
                }
            },
            series: [{
                name: 'speed',
                data,
                type:'line'
            }],
        
        })
    }, [data.length])

    return <div id='highChartContainer'></div> 
}

export default Charts