import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

import {
	Button,
	Dialog,
	Select,
	FormControl,
	InputLabel,
	MenuItem,
	DialogActions,
	DialogContent,
	DialogTitle,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import toastError from "../../errors/toastError";
import useQueues from "../../hooks/useQueues";
import useWhatsApps from "../../hooks/useWhatsApps";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../Can";

const useStyles = makeStyles((theme) => ({
  maxWidth: {
    width: "100%",
  },
}));

const TransferTicketModal = ({ modalOpen, onClose, ticketid,  ticketWhatsappId }) => {
	const history = useHistory();
	const [queues, setQueues] = useState([]);
	const [allQueues, setAllQueues] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [selectedQueue, setSelectedQueue] = useState('');
	const [selectedWhatsapp, setSelectedWhatsapp] = useState(ticketWhatsappId);
	const classes = useStyles();
	const { findAll: findAllQueues } = useQueues();
	const [users, setUsers] = useState([]);
	const { loadingWhatsapps, whatsApps } = useWhatsApps();
	const { user: loggedInUser } = useContext(AuthContext);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users/");
				setUsers(data.users);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	useEffect(() => {
		const loadQueues = async () => {
			const list = await findAllQueues();
			setAllQueues(list);
			setQueues(list);
		}
		loadQueues();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleClose = () => {
		onClose();
		setSelectedQueue(null);
		setSelectedUser(null);
		setSelectedWhatsapp(null);
	};

	const handleSaveTicket = async e => {
		e.preventDefault();
		if (!ticketid) return;
		setLoading(true);
		try {
			let data = {};
			if (selectedUser && selectedUser !== null) {
				data.userId = selectedUser
				data.status = 'pending';
				data.queueId = null;
				data.transf = true;

			}
			if (selectedQueue && selectedQueue !== null) {
				data.queueId = selectedQueue
				if (!selectedUser) {
					data.status = 'pending';
					data.userId = null;
					data.transf = true;
				}
			}

			if(selectedWhatsapp) {
				data.whatsappId = selectedWhatsapp;
			}

			await api.put(`/tickets/${ticketid}`, data);
			setLoading(false);
			history.push(`/tickets`);
		} catch (err) {
			setLoading(false);
			toastError(err);
		}
	};

	return (
		<Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
			<form onSubmit={handleSaveTicket}>
				<DialogTitle id="form-dialog-title">
					{i18n.t("transferTicketModal.title")}
				</DialogTitle>
				<DialogContent dividers>
				<FormControl variant="outlined" margin="dense" className={classes.maxWidth} style={{ marginTop: 20 }}>
						<InputLabel>
							{i18n.t("transferTicketModal.fieldUserLabel")}
						</InputLabel>
						  <Select
							value={selectedUser}
							onChange={(e) => setSelectedUser(e.target.value)}
							label={i18n.t("transferTicketModal.fieldUserPlaceholder")}
							>
							<MenuItem value={''}>&nbsp;</MenuItem>
							{users.map(user => (
								<MenuItem value={user.id}>{user.name}</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl variant="outlined" margin="dense" className={classes.maxWidth}  style={{ marginTop: 20 }}>
						<InputLabel>{i18n.t("transferTicketModal.fieldQueueLabel")}</InputLabel>
						<Select
							value={selectedQueue}
							onChange={(e) => setSelectedQueue(e.target.value)}
							label={i18n.t("transferTicketModal.fieldQueuePlaceholder")}
						>
							<MenuItem value={''}>&nbsp;</MenuItem>
							{queues.map((queue) => (
								<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
							))}
						</Select>
					</FormControl>
					<Can
						role={loggedInUser.profile}
						perform="ticket-options:transferWhatsapp"
						yes={() => (!loadingWhatsapps && 
							<FormControl variant="outlined" margin="dense" className={classes.maxWidth} style={{ marginTop: 20 }}>
								<InputLabel>{i18n.t("transferTicketModal.fieldConnectionLabel")}</InputLabel>
								<Select
									value={selectedWhatsapp}
									onChange={(e) => setSelectedWhatsapp(e.target.value)}
									label={i18n.t("transferTicketModal.fieldConnectionPlaceholder")}
								>
									<MenuItem value={''}>&nbsp;</MenuItem>
									{whatsApps.map((whasapp) => (
										<MenuItem key={whasapp.id} value={whasapp.id}>{whasapp.name}</MenuItem>
									))}
								</Select>
							</FormControl>
						)}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						disabled={loading}
						variant="outlined"
					>
						{i18n.t("transferTicketModal.buttons.cancel")}
					</Button>
					<ButtonWithSpinner
						variant="contained"
						type="submit"
						color="primary"
						loading={loading}
					>
						{i18n.t("transferTicketModal.buttons.ok")}
					</ButtonWithSpinner>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default TransferTicketModal;