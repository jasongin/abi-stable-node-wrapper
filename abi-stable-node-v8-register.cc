/*******************************************************************************
 * Experimental prototype for demonstrating VM agnostic and ABI stable API
 * for native modules to use instead of using Nan and V8 APIs directly.
 ******************************************************************************/

#include <node.h>
#include "abi-stable-node.h"

#define NODE_VERSION_4 46
#define NODE_VERSION_5 47
#define NODE_VERSION_6 48
#define NODE_VERSION_7 51

namespace v8impl {
   napi_env JsEnvFromV8Isolate(v8::Isolate* isolate);
   napi_value JsValueFromV8LocalValue(v8::Local<v8::Value> local);
}

#if NODE_MODULE_VERSION >= NODE_VERSION_4

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

#else

// TODO: Other versions

#endif // NODE_MODULE_VERSION

void napi_module_register(napi_module* mod) {
  // Register the module with node using the exact module version that it expects.
  // The private-data pointer for the registration cb is set to the napi_module struct.
  #if NODE_MODULE_VERSION >= NODE_VERSION_4

    static node::node_module nm = {
      NODE_MODULE_VERSION,
      mod->nm_flags,
      mod->nm_dso_handle,
      mod->nm_filename,
      NULL,
      napi_module_register_cb,
      mod->nm_modname,
      mod,
      NULL,
    };
    node::node_module_register(&nm);
    
  #else

    // TODO: Other versions

    int invalidVersion = 0;
    node::node_module_register(&invalidVersion);

  #endif // NODE_MODULE_VERSION
}

// Register the abi-stable-node module itself.
#if NODE_MODULE_VERSION >= NODE_VERSION_4

void this_module_register_cb(v8::Local<v8::Object> exports,
                             v8::Local<v8::Value> module,
                             v8::Local<v8::Context> context,
                             void* priv) {
}

NODE_MODULE_CONTEXT_AWARE(abi_stable_node, this_module_register_cb);

#else

// TODO: Other versions

#endif // NODE_MODULE_VERSION
