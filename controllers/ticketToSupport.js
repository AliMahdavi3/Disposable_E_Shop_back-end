const { validationResult } = require('express-validator');
const Ticket = require('../models/ticketToSupport');
const path = require('path');
const util = require('util');
const fs = require('fs');
const unlinkAsync = util.promisify(fs.unlink);
const sendEmail = require('../utils/emailSender');

exports.createTicket = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation Faild!, Your Entered Data is Invalid');
            error.statusCode = 422;
            throw error;
        }

        const { name, email, phone, subject, description, userId } = req.body;

        const ticket = new Ticket({
            name: name,
            email: email,
            phone: phone,
            subject: subject,
            description: description,
            status: 'open',
            // Optional file upload below
            imageUrl: req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [],
            userId: req.user._id,
        });
        const ticketResults = await ticket.save();

        await sendEmail({
            option: {
                userEmail: email,
                subject: "ثبت تیکت",
                html: `<p>تیکت شما با موفقیت ارسال شد!</p>`
            },
        });

        res.status(201).json({
            message: "Ticket Created Successfully!",
            ticket: ticketResults,
        });


    } catch (error) {
        if (req.files) {
            for (let file of req.files) {
                try {
                    await unlinkAsync(file.path);
                } catch (cleanupError) {
                    console.error('Error cleaning up files:', cleanupError);
                }
            }
        }
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getAllTickets = async (req, res, next) => {
    try {
        const ticketList = await Ticket.find();
        res.status(200).json({
            message: "Tickets fetched successfully!",
            tickets: ticketList,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getSingleTicket = async (req, res, next) => {
    try {
        const ticketId = req.params.ticketId;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            const error = new Error('Ticket not found!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: "Ticket fetched successfully!",
            ticket: ticket
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateTicket = async (req, res, next) => {
    try {
        const ticketId = req.params.ticketId;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            const error = new Error('Ticket not found!');
            error.statusCode = 404;
            throw error;
        }

        const { subject, description, status } = req.body;

        if (subject) ticket.subject = subject;
        if (description) ticket.description = description;
        if (status) ticket.status = status;

        if (req.files && req.files.length > 0) {
            if (ticket.imageUrl && ticket.imageUrl.length > 0) {
                for (let imagePath of ticket.imageUrl) {
                    try {
                        await unlinkAsync(imagePath);
                    } catch (cleanupError) {
                        console.error('Error cleaning up file:', cleanupError);
                    }
                }
            }
            ticket.imageUrl = req.files.map(file => file.path.replace(/\\/g, '/'));
        }
        const updatedTicket = await ticket.save();

        res.status(200).json({
            message: 'Ticket updated successfully!',
            ticket: updatedTicket
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.deleteTicket = async (req, res, next) => {
    try {
        const ticketId = req.params.ticketId;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            const error = new Error('Ticket not found!');
            error.statusCode = 404;
            throw error;
        }

        if (ticket.imageUrl && ticket.imageUrl.length > 0) {
            for (let imagePath of ticket.imageUrl) {
                try {
                    await unlinkAsync(imagePath);
                } catch (cleanupError) {
                    console.error('Error cleaning up file:', cleanupError);
                }
            }
        }

        await Ticket.findByIdAndDelete(ticketId);

        res.status(200).json({
            message: "Ticket deleted successfully!",
        });

    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}