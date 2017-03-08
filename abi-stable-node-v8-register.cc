/*******************************************************************************
 * Experimental prototype for demonstrating VM agnostic and ABI stable API
 * for native modules to use instead of using Nan and V8 APIs directly.
 ******************************************************************************/

#include <node.h>
#include "abi-stable-node.h"

namespace v8impl {
   napi_env JsEnvFromV8Isolate(v8::Isolate* isolate);
   napi_value JsValueFromV8LocalValue(v8::Local<v8::Value> local);
}

void napi_module_register_cb(v8::Local<v8::Object> exports,
                             v8::Local<v8::Value> module,
                             v8::Local<v8::Context> context,
                             void* priv) {
  napi_module* mod = static_cast<napi_module*>(priv);
  mod->nm_register_func(
    v8impl::JsEnvFromV8Isolate(context->GetIsolate()),
    v8impl::JsValueFromV8LocalValue(exports),
    v8impl::JsValueFromV8LocalValue(module),
    mod->nm_priv);
}

void napi_module_register(napi_module* mod) {
  // Register the module with node using the exact module version that it expects.
  // The private-data pointer for the registration cb is set to the napi_module struct.
  static node::node_module nm = {
    NODE_MODULE_VERSION,
    mod->nm_flags,
    nullptr,
    mod->nm_filename,
    NULL,
    napi_module_register_cb,
    mod->nm_modname,
    mod,
    NULL,
  };
  node::node_module_register(&nm);
}
