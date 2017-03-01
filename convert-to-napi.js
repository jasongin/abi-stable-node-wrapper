"use strict";

const fs = require('fs');
const path = require('path');

const napiVersion = require('./package.json').version;

let excludeDirs = [
	'.git',
	'node_modules',
];

let replacementsMap = {
	'package.json': [
		[ /"nan": *"[^"]+"/, `"node-api": "^${napiVersion}"` ],
	],
	'binding.gyp': [
		[ /node -e \\"require\('nan'\)\\"/, "node -p \\\"require('node-api').include\\\"" ],
	],
	'*.h|*.cc|*.cpp': [
		[ /#include +(<|")(?:node|nan).h("|>)/, "#include $1napi.h$2\n#include $1uv.h$2" ],
		[ /using namespace (node|v8);/, '' ],
		[ /NODE_MODULE\((\w+), *(\w+)\)/, 'NODE_API_MODULE($1, $2)' ],
		[ /NAN_MODULE_INIT\(([\w:]+)\)/, 'void $1(Napi::Env env, Napi::Object target, Napi::Object module)' ],
		[ /::(Init(?:ialize)?)\(target\)/, '::$1(env, target, module)' ],

		[ /Nan::(Undefined|Null|True|False)\(\)/, 'env.$1()' ],

		[ /info\[(\w+)\]->/, 'info[$1].' ],
		[ /info\.This\(\)->/, 'info.This().' ],
		[ /->Is(Object|String|Int32|Number)\(\)/, '.Is$1()' ],

		[ /Local<Value>/, 'Napi::Value' ],
		[ /Local<Boolean>/, 'Napi::Boolean' ],
		[ /Local<String>/, 'Napi::String' ],
		[ /Local<Number>/, 'Napi::Number' ],
		[ /Local<Object>/, 'Napi::Object' ],
		[ /Local<Array>/, 'Napi::Array' ],
		[ /Local<External>/, 'Napi::External' ],
		[ /Local<Function>/, 'Napi::Function' ],

		[ /\.As<Object>\(\)/, '.As<Napi::Object>()' ],
		[ /\.As<String>\(\)/, '.As<Napi::String>()' ],
		[ /\.As<Array>\(\)/, '.As<Napi::Array>()' ],
		[ /\.As<Function>\(\)/, '.As<Napi::Function>()' ],

		[ /.IsInt32\(\)/, '.IsNumber()' ],

		[ /\Nan::To<(?:int|int32_t)>\(([^)]+)\)/, '($1).ToNumber().Int32Value()' ],
		[ /\Nan::To<double>\(([^)]+)\)/, '($1).ToNumber().DoubleValue()' ],
		[ /\Nan::To<bool>\(([^)]+)\)/, '($1).ToBoolean().Value()' ],
		[ /\Nan::To<Object>\(([^)]+)\)/, '($1).ToObject()' ],
		[ /\Nan::To<String>\(([^)]+)\)/, '($1).ToString()' ],

		[ /Nan::New\((\w+)\)->HasInstance\((\w+)\)/, '$2.InstanceOf($1.Value())' ],

		[ /\.ToLocalChecked\(\)/, '' ],
		[ /\.FromJust\(\)/, '' ],

		[ /Nan::Get\(([^,]+),\s*/m, '($1).Get(' ],
		[ /\.Get\([\s|\\]*Nan::New\(([^)]+)\)\)/m, '.Get($1)' ],

		[ /Nan::Set\(([^,]+),/m, '($1).Set(' ],
		[ /\.Set\([\s|\\]*Nan::New\(([^)]+)\),/m, '.Set($1,' ],

		[ /Nan::New\(([^)]+)\)/, 'Napi::String::New(env, $1)' ],
		[ /Nan::String::New\(/, 'Napi::String::New(env, ' ],
		[ /Nan::New<String>\(/, 'Napi::String::New(env, ' ],
		[ /Nan::New<(Integer|Number)>\(/, 'Napi::Number::New(env, ' ],
		[ /Nan::New<Array>\(/, 'Napi::Array::New(env, ' ],
		[ /Nan::New<Object>\(\)/, 'Napi::Object::New(env)' ],

		[ /return Nan::Throw(Type|Range)?Error\(/, 'throw Napi::$1Error::New(env, ' ],

		[ /Napi::(\w+)::Cast\(([^)]+)\)/, '$2.As<Napi::$1>()' ],

		[ /\*Nan::Utf8String\(([^)]+)\)/, '$1->As<Napi::String>().Utf8Value().c_str()' ],
		[ /Nan::Utf8String +(\w+)\(([^)]+)\)/, 'std::string $1 = $2.As<Napi::String>()' ],
		[ /Nan::Utf8String/, 'std::string' ],

		[ /Nan::MakeCallback\(([^,]+),[\s\\]+([^,]+),/m, '$2.MakeCallback($1,' ],

		[ /class\s+(\w+)\s*:\s*public\s+Nan::ObjectWrap/, 'class $1 : public Napi::ObjectWrap<$1>'],
		[ /(\w+)\(([^\)]*)\)\s*:\s*Nan::ObjectWrap\(\)\s*(,)?/m, '$1($2) : Napi::ObjectWrap<$1>()$3' ],

		[ /static\s+NAN_METHOD\((\w+)\);/, 'Napi::Value $1(const Napi::CallbackInfo& info);' ],
		[ /NAN_METHOD\((\w+)::(\w+)\)(\s*){/, 'Napi::Value $1::$2(const Napi::CallbackInfo& info)$3{\n  Napi::Env env = info.Env();' ],

		[ /static\s+NAN_GETTER\((\w+)\);/, 'Napi::Value $1(const Napi::CallbackInfo& info);' ],
		[ /NAN_GETTER\((\w+)::(\w+)\)(\s*){/, 'Napi::Value $1::$2(const Napi::CallbackInfo& info)$3{\n  Napi::Env env = info.Env();' ],

		// Declare an env in helper functions that take a Napi::Value
		[ /(\w+)\(Napi::Value (\w+)(,\s*[^\()]+)?\)\s*{/, '$1(Napi::Value $2$3) {\n  Napi::Env env = $2.Env();' ],

		[ /Nan::NAN_METHOD_ARGS_TYPE/, 'const Napi::CallbackInfo&' ],

		[ /(\w+)\*\s+(\w+)\s*=\s*Nan::ObjectWrap::Unwrap<\w+>\(info\.This\(\)\);/, '$1* $2 = this;' ],
		[ /Nan::ObjectWrap::Unwrap<(\w+)>\((.*)\);/, '$2.Unwrap<$1>();' ],
		[ /info.GetReturnValue\(\)\.Set\(([^)]+)\)/, 'return $1' ],

		[ /Nan::Persistent<Function(Template)?>/, 'Napi::FunctionReference' ],
		[ /Nan::Persistent<Object>/, 'Napi::ObjectReference' ],
		[ /Nan::(Escapable)?HandleScope\s+(\w+)\s*;/, 'Napi::$1HandleScope $2(env);' ],
		[ /Nan::(Escapable)?HandleScope/, 'Napi::$1HandleScope' ],
		[ /Nan::ForceSet\(([^,]+), ?/, '$1->DefineProperty(' ],
		[ /\.ForceSet\(Napi::String::New\(env, "(\w+)"\),\s*?/, '.DefineProperty("$1", ' ],
//		[ /Nan::GetPropertyNames\(([^,]+)\)/, '$1->GetPropertyNames()' ],
		[ /Nan::Equals\(([^,]+),/, '$1.Equals(' ],

		[ /Nan::CopyBuffer\(/, 'Napi::Buffer::Copy(env, ' ],

		[ /^.*->SetInternalFieldCount\(.*$/m, '' ],
		[ /Local<FunctionTemplate>\s+(\w+)\s*=\s*Nan::New<FunctionTemplate>\([\w:]+\);(?:\w+->Reset\(\1\))?\s+\1->SetClassName\(Napi::String::New\(env, "(\w+)"\)\);/,
		  'Napi::Function $1 = DefineClass(env, "$2", {' ],
		[ /Nan::SetPrototypeMethod\(\w+, "(\w+)", (\w+)\);/, '  InstanceMethod("$1", &$2),' ],
		[ /(?:\w+\.Reset\(\w+\);\s+)?\(target\)\.Set\("(\w+)",\s*Nan::GetFunction\((\w+)\)\);/m,
		  '});\n\n' +
		  '  constructor = Napi::Persistent($2);\n' +
		  '  constructor.SuppressDestruct();\n' +
		  '  target.Set("$1", $2);' ],
		[ /constructor_template/, 'constructor' ],

		// TODO: Other attribute combinations
		// TODO: Update to newer napi attribute naming
		//[ /static_cast<PropertyAttribute>\(ReadOnly\s*\|\s*DontDelete\)/m,
		//  'static_cast<napi_property_attributes>(napi_enumerable | napi_configurable)' ],
		[ /static_cast<PropertyAttribute>\(ReadOnly\s*\|\s*DontDelete\)/m,
		  'static_cast<napi_property_attributes>(napi_read_only | napi_dont_delete)' ],
	],
};

let targetDir = process.argv[2];
if (!targetDir) {
	console.log('Usage: node ' + path.basename(__filename) + ' <target-dir>');
	process.exit(1);
}

Object.keys(replacementsMap).forEach(filePattern => {
	let filesRegex = filePattern.replace(/\./g, '#').replace(/\*/g, '.*').replace(/\#/g, '\\.');
	filesRegex = new RegExp(filesRegex.split('|').map(p => '^' + p + '$').join('|'));
	replaceTextInFiles(
		'.',
		filesRegex,
		replacementsMap[filePattern]);
});

function replaceTextInFiles(dirPath, filesRegex, replacements) {
	fs.readdirSync(dirPath).forEach(childName => {
		let childPath = path.join(dirPath, childName);
		let stats = fs.statSync(childPath);
		if (stats.isDirectory()) {
			if (excludeDirs.indexOf(childName) < 0) {
				replaceTextInFiles(childPath, filesRegex, replacements);
			}
		} else if (filesRegex.test(childName)) {
			replaceTextInFile(childPath, replacements);
		}
	});
}

function replaceTextInFile(filePath, replacements) {
	let text = fs.readFileSync(filePath, 'utf8');
	let text2 = text;
	replacements.forEach(replacement => {
		let findRegex = makeGlobalRegExp(replacement[0]);
		let replaceText = replacement[1];
		text2 = text2.replace(findRegex, replaceText);
	});
	if (text2 !== text) {
		console.log('Writing converted file : ' + filePath);
		fs.writeFileSync(filePath, text2, 'utf8');
	} else {
		console.log('No conversion necessary: ' + filePath);
	}
}

function makeGlobalRegExp(r) {
	if (!r.global) {
		r = new RegExp(r.source, 'g' + (r.ignoreCase ? 'i' : '') + (r.multiline ? 'm' : ''));
	}
	return r;
}
