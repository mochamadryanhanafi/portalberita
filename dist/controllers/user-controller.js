import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
import User from '../models/user.js';
import { Role } from '../types/role-type.js';
export const getAllUserHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find().select('_id fullName role email');
        return res.status(HTTP_STATUS.OK).json({ users });
    }
    catch (error) {
        console.log(error);
        res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR });
    }
});
export const changeUserRoleHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const { role } = req.body;
        if (role === Role.User || role === Role.Admin) {
            const user = yield User.findById(userId);
            if (!user)
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .json({ message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS });
            user.role = role;
            user.save();
        }
        else {
            return res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
        }
        return res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.USERS.UPDATE });
    }
    catch (error) {
        console.log(error);
        res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR, error: error });
    }
});
export const deleteUserHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const user = yield User.findByIdAndDelete(userId);
        if (!user)
            return res
                .status(HTTP_STATUS.NOT_FOUND)
                .json({ message: RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS });
        res.status(HTTP_STATUS.NO_CONTENT).json({ message: RESPONSE_MESSAGES.USERS.DELETED });
    }
    catch (error) {
        console.log(error);
        res
            .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
            .json({ message: RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR, error: error });
    }
});
