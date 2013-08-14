/**
 * 
 */
package wxq.qinglan.com.rhino;

/**
 * @author wxq
 *
 */
public class Console {

	private static Console console = null;
	
	/**
	 * 
	 */
	private Console() {
		
	}

	public static Console getInstance() {
		if(null == console){
			console = new Console();
		}
		return console;
	}
	
	public void log(Object ...args) {
		System.out.println(args.getClass()); 
        for (Object arg : args) {
        	System.out.println(arg);
        }  
	}
}
