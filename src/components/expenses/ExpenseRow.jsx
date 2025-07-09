import { useState } from "react";

const ExpenseRow = (props) => {
	
};

export default ExpenseRow;

<td>
												{editRowId === expense.key ? (
													<Form.Select
														aria-label="category"
														value={category}
														onChange={(e) => {
															setCategory(
																e.target.value
															);
														}}
													>
														{categoryList.map(
															(cat) => (
																<option
																	key={cat}
																	value={cat}
																>
																	{cat}
																</option>
															)
														)}
													</Form.Select>
												) : (
													expense.category
												)}
											</td>
											<td>
												{editRowId === expense.key ? (
													<Form.Control
														type="text"
														placeholder="Enter Expense Name"
														value={expenseName}
														onChange={(e) =>
															setExpenseName(
																e.target.value
															)
														}
														autoFocus
													/>
												) : (
													expense.name
												)}
											</td>
											<td>
												{editRowId === expense.key ? (
													<InputGroup>
														<Form.Control
															type="number"
															placeholder="Enter Expense Amount"
															value={
																expenseAmount
															}
															onChange={(e) => {
																setExpenseAmount(
																	e.target
																		.value
																);
															}}
															style={{
																width: "80%",
															}}
														/>
														<Form.Select
															aria-label="currency"
															style={{
																width: "20%",
															}}
															value={currency}
															onChange={(e) => {
																setCurrency(
																	e.target
																		.value
																);
															}}
														>
															<option value="usd">
																USD
															</option>
															<option value="khr">
																Riel
															</option>
															<option value="mmk">
																MMK
															</option>
														</Form.Select>
													</InputGroup>
												) : (
													`${
														expense.amount
													}  (${expense.currency.toUpperCase()})`
												)}
											</td>
											<td>
												{editRowId === expense.key ? (
													<>
														<Button
															variant="primary"
															size="sm"
															onClick={
																updateExpenseHandler
															}
														>
															<FontAwesomeIcon
																icon={
																	faFloppyDisk
																}
															/>
														</Button>{" "}
														&nbsp;
														<Button
															variant="dark"
															size="sm"
															onClick={
																cancelEditHandler
															}
														>
															<FontAwesomeIcon
																icon={faXmark}
															/>
														</Button>
													</>
												) : (
													<>
														<Button
															variant="primary"
															size="sm"
															onClick={() =>
																editExpenseHandler(
																	expense
																)
															}
														>
															<FontAwesomeIcon
																icon={faFilePen}
															/>
														</Button>{" "}
														&nbsp;
														<Button
															variant="danger"
															size="sm"
															onClick={() =>
																deleteHandler(
																	expense.key
																)
															}
														>
															<FontAwesomeIcon
																icon={faEraser}
															/>
														</Button>
													</>
												)}
											</td>