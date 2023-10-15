export class FLAGS {
  static UNAUTHORIZED = 'Unauthorized';

  static STATUS = {
    200: 'OK',
  };

  static ERROR = {
    FETCH: "Couldn't find any data on this",
    NOT_DEFINED: (VARIABLE) => `${VARIABLE} is not defined`,
  };
}
