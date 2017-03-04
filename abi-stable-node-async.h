#ifndef SRC_NODE_ASYNCAPI_H_
#define SRC_NODE_ASYNCAPI_H_

#include <stdlib.h>
#include "abi-stable-node-async-types.h"

#ifdef _WIN32
# ifdef BUILDING_NODE_API
#   define NODE_API __declspec(dllexport)
# else
#   define NODE_API __declspec(dllimport)
# endif
#else
# define NODE_API /* nothing */
#endif

extern "C" {
NODE_API napi_work napi_create_async_work();
NODE_API void napi_delete_async_work(napi_work w);
NODE_API void napi_async_set_data(napi_work w, void* data);
NODE_API void napi_async_set_execute(napi_work w, void (*execute)(void*));
NODE_API void napi_async_set_complete(napi_work w, void (*complete)(void*));
NODE_API void napi_async_set_destroy(napi_work w, void (*destroy)(void*));
NODE_API void napi_async_queue_worker(napi_work w);
} // extern "C"

#endif // SRC_NODE_ASYNCAPI_H_
