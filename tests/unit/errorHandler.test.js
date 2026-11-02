require('../setup');
const errorHandler = require('../../middleware/errorHandler');

describe('errorHandler', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should handle express-validator errors (type: validation)', () => {
    const err = {
      type: 'validation',
      message: 'Validation failed',
      errors: ['Name is required', 'Email is invalid']
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: ['Name is required', 'Email is invalid']
    });
  });

  it('should handle Mongoose ValidationError', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' }
      }
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Name is required, Email is invalid'
    });
  });

  it('should handle Mongoose CastError for invalid ObjectId', () => {
    const err = {
      name: 'CastError',
      kind: 'ObjectId',
      message: 'Cast to ObjectId failed'
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid student ID format'
    });
  });

  it('should handle MongoDB duplicate key error (code 11000)', () => {
    const err = {
      code: 11000,
      message: 'Duplicate key error'
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email already exists'
    });
  });

  it('should handle generic errors with custom statusCode', () => {
    const err = {
      statusCode: 404,
      message: 'Not found'
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Not found'
    });
  });

  it('should handle generic errors without statusCode (default to 500)', () => {
    const err = {
      message: 'Something unexpected happened'
    };

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Something unexpected happened'
    });
  });

  it('should handle errors without message (default message)', () => {
    const err = {};

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Something went wrong'
    });
  });
});
