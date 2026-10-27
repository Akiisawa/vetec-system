const { DomainError } = require('../../shared/domain/errors');
const logger = require('../../infrastructure/logging/logger');
function notFoundHandler(req,res){res.status(404).json({ok:false,error:{code:'NOT_FOUND',message:'Rota não encontrada'}})}
function errorHandler(err,req,res,next){
  if(err instanceof DomainError)return res.status(err.httpStatus).json({ok:false,error:{code:err.code,message:err.message,details:err.details}});
  logger.error('Erro não tratado:',err);
  res.status(500).json({ok:false,error:{code:'INTERNAL',message:'Erro interno'}});
}
module.exports = { notFoundHandler, errorHandler };