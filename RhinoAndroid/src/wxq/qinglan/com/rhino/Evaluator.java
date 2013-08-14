package wxq.qinglan.com.rhino;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

class Evaluator {
	private Object theActivity;
	private Object contentView;
	private Context cx;
	private Scriptable scope;

	public Evaluator() {

		cx = Context.enter();
		cx.setOptimizationLevel(-1);

		scope = cx.initStandardObjects();
	}

	public void exit() {
		Context.exit();
	}

	public Object eval(final String code) {
		try {
			// ContextFactory.enterContext(cx);
			return cx.evaluateString(scope, code, "eval:", 1, null);
		} catch (Exception e) {
			e.printStackTrace();
			return e;
		}
	}

	public void init() {
		if (theActivity != null && contentView != null) {
			ScriptableObject.putProperty(scope, "TheActivity",
					Context.javaToJS(theActivity, scope));

			ScriptableObject.putProperty(scope, "TheContentView",
					Context.javaToJS(contentView, scope));

			ScriptableObject.putProperty(scope, "Out",
					Context.javaToJS(System.out, scope));

			ScriptableObject.putProperty(scope, "console",
					Context.javaToJS(Console.getInstance(), scope));
		}
	}

	public Object getTheActivity() {
		return theActivity;
	}

	public void setTheActivity(Object theActivity) {
		this.theActivity = theActivity;
	}

	public Object getContentView() {
		return contentView;
	}

	public void setContentView(Object contentView) {
		this.contentView = contentView;
	}

	public Context getCx() {
		return cx;
	}

	public void setCx(Context cx) {
		this.cx = cx;
	}

	public Scriptable getScope() {
		return scope;
	}

	public void setScope(Scriptable scope) {
		this.scope = scope;
	}
}