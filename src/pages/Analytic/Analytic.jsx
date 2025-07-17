import { Col, Row } from "react-bootstrap";
import Line from "../../components/Nivo/Line";

const Analytic = () => {
	const data = [
		{
			id: "japan",
			color: "red",
			data: [
				{
					x: "plane",
					y: 294,
				},
				{
					x: "helicopter",
					y: 271,
				},
				{
					x: "boat",
					y: 171,
				},
				{
					x: "train",
					y: 77,
				},
				{
					x: "subway",
					y: 71,
				},
				{
					x: "bus",
					y: 254,
				},
				{
					x: "car",
					y: 9,
				},
				{
					x: "moto",
					y: 123,
				},
				{
					x: "bicycle",
					y: 21,
				},
				{
					x: "horse",
					y: 40,
				},
				{
					x: "skateboard",
					y: 270,
				},
				{
					x: "others",
					y: 26,
				},
			],
		},
	];

	const mydata = [
		{
			id: "Total Cost",
			data: [
				{ x: "2023-01-01", y: 345 },
				{ x: "2023-01-02", y: 187 },
				{ x: "2023-01-03", y: 492 },
				{ x: "2023-01-04", y: 210 },
				{ x: "2023-01-05", y: 305 },
				{ x: "2023-01-06", y: 123 },
				{ x: "2023-01-07", y: 450 },
				{ x: "2023-01-08", y: 278 },
				{ x: "2023-01-09", y: 380 },
				{ x: "2023-01-10", y: 95 },
			],
		},
	];
	return (
		<>
			<Row>
				<Col xs={12}>
					<h3>Analytics</h3>
				</Col>
			</Row>
			<Row>
				<Col xs={12}>
					<Line data={mydata} />
				</Col>
			</Row>
		</>
	);
};

export default Analytic;
