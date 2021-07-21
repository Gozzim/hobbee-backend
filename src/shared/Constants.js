// RFC 5322 Official Standard - Source: http://emailregex.com/
const MAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/; // prettier-ignore
const PASS_REGEX = /^(?=.*[A-Z])(?=.*[a-z])((?=.*[^0-9a-zA-Z\s:])|(?=.*[0-9]))[\S]{6,32}$/; // prettier-ignore
const USERNAME_REGEX = /^[A-Za-z0-9\-_]{4,16}$/; // prettier-ignore
const GROUPNAME_REGEX = /^\S((?!(\s|_|-){2})[a-zA-Z0-9\-_\x20]){2,16}\S$/; // prettier-ignore

const ERRORS = {
  userNotFound: "User not found",
  invalidCredentials: "Invalid credentials",
  invalidUsername: "Invalid Username",
  invalidEmail: "Invalid Email",
  invalidPassword: "Invalid Password",
  invalidToken: "Failed to authenticate token",
  expiredToken: "Expired token",
  invalidRecoveryToken: "Invalid or expired recovery token",
  userAlreadyExists: "User already exists",
  usernameTaken: "Username is taken",
};

const SUBSCRIPTION_PLAN = {
  elite: "P-62E82252FP3121819MDZR2EY",
  advanced: "P-6RW02432GE006263HMDZRZZY",
  standard: "P-0MA943175X946230LMDZRZSQ",
};

module.exports = {
  MAIL_REGEX,
  PASS_REGEX,
  USERNAME_REGEX,
  GROUPNAME_REGEX,
  ERRORS,
  SUBSCRIPTION_PLAN,
};
