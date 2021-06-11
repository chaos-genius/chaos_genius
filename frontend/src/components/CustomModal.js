import React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Icon from "@material-ui/core/Icon";
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';


// import './AlertDialog.css';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


export default function AlertDialog(props) {
    const { handleCloseCallback } = props;

    const handleClose = () => {
        if (handleCloseCallback !== undefined) {
            handleCloseCallback();
        }
    };

    return (
        <div className="Custom-Dialog" >
            <Dialog
                TransitionComponent={Transition}
                open={props.open}
                keepMounted
                fullWidth={true}
                onClose={handleCloseCallback}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
                className="custom-modal"
            >
                <DialogTitle id="alert-dialog-slide-title">{props.title}
                    {
                        (props.subtitle) ?
                            (
                                <div className="subTitle-Modal"><Icon>info</Icon>
                                    {props.subtitle}
                                </div>
                            )
                            : (null)
                    }

                    <IconButton aria-label="close" onClick={handleClose} className="close-button">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                {props.body}

            </Dialog>
        </div>
    );
}
