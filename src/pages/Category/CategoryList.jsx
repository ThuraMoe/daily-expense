import { faEraser, faFilePen, faFloppyDisk, faSquarePlus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";


const CategoryList = () => {

    const [newRowData, setNewRowData] = useState(null);

    const addNewRowHandler = () => {
        setNewRowData({id: Date.now(), category:''});
    }

    const saveNewRecordHandler = () => {}

    const saveCancellationHandler = () => {
        setNewRowData(null);
    }


    return (
        <>
            <Row>
                <Col xs={12}>
                    <h3>Category</h3>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    {
                        !newRowData && (
                            <Button size="sm" variant="primary" onClick={addNewRowHandler}><FontAwesomeIcon icon={faSquarePlus} /></Button>
                        )
                    }
                    <Table striped borderless hover>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody >
                            {
                                newRowData && (
                                    <tr key={newRowData.id}>
                                        <td>
                                            <Form.Control size="sm" type="text" placeholder="Enter Category Name" autoFocus/>
                                        </td>
                                        <td>
                                            <Button size="sm"><FontAwesomeIcon icon={faFloppyDisk} onClick={saveNewRecordHandler} /></Button>{" "} &nbsp;
                                            <Button size="sm" variant="danger"><FontAwesomeIcon icon={faXmark} onClick={saveCancellationHandler} /></Button>
                                            {/* <Button size="sm"><FontAwesomeIcon icon={faFilePen} /></Button>{" "} &nbsp;
                                            <Button size="sm" variant="danger"><FontAwesomeIcon icon={faEraser} /></Button> */}
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </>
    )
}

export default CategoryList;